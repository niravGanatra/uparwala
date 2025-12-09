import csv
import io
from decimal import Decimal
from django.utils.text import slugify
from products.models import Product, ProductImage, ProductAttribute, Category
from vendors.models import VendorProfile


def process_product_csv(csv_file, vendor):
    """
    Process bulk product upload CSV file
    
    Expected CSV columns:
    - name (required)
    - sku (required)
    - description
    - short_description
    - category_slug
    - regular_price (required)
    - sale_price
    - stock
    - weight
    - length
    - width
    - height
    - image_url (comma-separated URLs)
    - attributes (JSON format: {"Color": "Red", "Size": "Large"})
    """
    results = {
        'success': [],
        'errors': [],
        'total': 0,
        'created': 0,
        'updated': 0,
        'failed': 0
    }
    
    try:
        # Decode and read CSV
        csv_content = csv_file.read().decode('utf-8')
        reader = csv.DictReader(io.StringIO(csv_content))
        
        for row_num, row in enumerate(reader, start=2):
            results['total'] += 1
            
            try:
                # Validate required fields
                if not row.get('name') or not row.get('sku') or not row.get('regular_price'):
                    raise ValueError("Missing required fields: name, sku, or regular_price")
                
                # Get or create category
                category = None
                if row.get('category_slug'):
                    try:
                        category = Category.objects.get(slug=row['category_slug'])
                    except Category.DoesNotExist:
                        raise ValueError(f"Category with slug '{row['category_slug']}' not found")
                
                # Generate slug from name
                slug = slugify(row['name'])
                
                # Check if product exists (by SKU)
                product, created = Product.objects.update_or_create(
                    sku=row['sku'],
                    defaults={
                        'vendor': vendor,
                        'category': category,
                        'name': row['name'],
                        'slug': slug,
                        'description': row.get('description', ''),
                        'short_description': row.get('short_description', ''),
                        'regular_price': Decimal(row['regular_price']),
                        'sale_price': Decimal(row['sale_price']) if row.get('sale_price') else None,
                        'stock': int(row.get('stock', 0)),
                        'weight': Decimal(row['weight']) if row.get('weight') else None,
                        'length': Decimal(row['length']) if row.get('length') else None,
                        'width': Decimal(row['width']) if row.get('width') else None,
                        'height': Decimal(row['height']) if row.get('height') else None,
                        'is_active': True,
                    }
                )
                
                # Handle attributes
                if row.get('attributes'):
                    import json
                    try:
                        attributes = json.loads(row['attributes'])
                        for attr_name, attr_value in attributes.items():
                            ProductAttribute.objects.update_or_create(
                                product=product,
                                name=attr_name,
                                defaults={'value': attr_value}
                            )
                    except json.JSONDecodeError:
                        pass  # Skip invalid JSON
                
                # Track success
                if created:
                    results['created'] += 1
                    results['success'].append({
                        'row': row_num,
                        'sku': row['sku'],
                        'name': row['name'],
                        'action': 'created'
                    })
                else:
                    results['updated'] += 1
                    results['success'].append({
                        'row': row_num,
                        'sku': row['sku'],
                        'name': row['name'],
                        'action': 'updated'
                    })
                
            except Exception as e:
                results['failed'] += 1
                results['errors'].append({
                    'row': row_num,
                    'sku': row.get('sku', 'N/A'),
                    'error': str(e)
                })
    
    except Exception as e:
        results['errors'].append({
            'row': 0,
            'error': f"CSV parsing error: {str(e)}"
        })
    
    return results


def generate_csv_template():
    """Generate a CSV template for bulk product upload"""
    template = io.StringIO()
    writer = csv.writer(template)
    
    # Write headers
    headers = [
        'name', 'sku', 'description', 'short_description', 'category_slug',
        'regular_price', 'sale_price', 'stock', 'weight', 'length', 'width', 'height',
        'image_url', 'attributes'
    ]
    writer.writerow(headers)
    
    # Write sample row
    sample = [
        'Sample Product',
        'SKU-001',
        'This is a detailed product description',
        'Short description for listing',
        'home-decor',
        '999.00',
        '799.00',
        '50',
        '0.5',
        '10',
        '10',
        '5',
        'https://example.com/image1.jpg,https://example.com/image2.jpg',
        '{"Color": "Red", "Size": "Medium"}'
    ]
    writer.writerow(sample)
    
    template.seek(0)
    return template.getvalue()

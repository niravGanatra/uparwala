"""
Management command to update CMS pages with specific content.
Run with: python manage.py update_cms_pages
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from products.models import CMSPage


class Command(BaseCommand):
    help = 'Update or create CMS pages with content'

    def handle(self, *args, **options):
        # Security Policy Page
        security_content = """
<h2>Security</h2>
<p><strong>Last Updated:</strong> December 21, 2025</p>

<p>At Uparwala Traders LLP ("Company", "We", "Us", or "Our"), We prioritize the security of Our Platform, Uparwala.in, to protect Users, Vendors, and their data. This Security Policy outlines Our practices to ensure a safe and secure environment for buying and selling Hindu religious products and related food items. While We implement robust measures, security is a shared responsibility, and Users must also take precautions.</p>

<h3>1. Data Security Measures</h3>
<ul>
<li><strong>Encryption:</strong> All sensitive data, including personal information and payment details, is transmitted using Secure Sockets Layer (SSL)/Transport Layer Security (TLS) encryption (at least TLS 1.2). This ensures data is protected during transit.</li>
<li><strong>Access Controls:</strong> We use role-based access controls, multi-factor authentication (MFA) for administrative accounts, and regular audits to prevent unauthorized access to Our systems.</li>
<li><strong>Firewalls and Intrusion Detection:</strong> Our servers are protected by firewalls, intrusion detection/prevention systems (IDS/IPS), and regular vulnerability scans to detect and mitigate threats.</li>
<li><strong>Data Storage:</strong> Data is stored in secure, compliant data centers in India, adhering to standards like ISO 27001 and the Information Technology Act, 2000.</li>
</ul>

<h3>2. Payment Security</h3>
<ul>
<li>Payments are processed through PCI DSS-compliant third-party gateways (e.g., Razorpay, PayU). We do not store full credit/debit card details on Our servers; only tokenized information is retained for recurring transactions.</li>
<li>We support secure payment methods like UPI, net banking, and wallets, ensuring compliance with RBI guidelines.</li>
<li><strong>Fraud Detection:</strong> We employ AI-based tools to monitor transactions for suspicious activity, such as unusual patterns or high-risk IP addresses.</li>
</ul>

<h3>3. User Account Security</h3>
<ul>
<li><strong>Password Policies:</strong> Users must use strong passwords (minimum 8 characters, including uppercase, lowercase, numbers, and symbols). We encourage enabling MFA where available.</li>
<li><strong>Session Management:</strong> Inactive sessions time out automatically, and We log suspicious login attempts.</li>
<li><strong>Vendor Verification:</strong> Vendors undergo KYC (Know Your Customer) checks, including GSTIN validation and bank account verification, to prevent fraudulent listings.</li>
</ul>

<h3>4. Vendor and Product Security</h3>
<ul>
<li>Vendors must ensure Products are free from contaminants or hazards. For food items, compliance with FSSAI standards is mandatory, including secure packaging to prevent tampering.</li>
<li>We scan uploaded images and content for malware using automated tools.</li>
<li>The Platform prohibits listings of hazardous materials; any violations lead to immediate removal and Account suspension.</li>
</ul>

<h3>5. Incident Response and Reporting</h3>
<ul>
<li>In case of a security breach, We follow an incident response plan compliant with the CERT-In directions under the IT Act. Affected Users will be notified within 72 hours, as required.</li>
<li>Users should report security vulnerabilities or incidents to <a href="mailto:security@uparwala.in">security@uparwala.in</a>. We may offer bug bounties for responsible disclosures.</li>
<li>We conduct regular penetration testing and security audits by third-party experts.</li>
</ul>

<h3>6. User Responsibilities</h3>
<ul>
<li>Keep Your devices secure with updated antivirus software and avoid public Wi-Fi for sensitive transactions.</li>
<li>Do not share Account credentials or click on suspicious links.</li>
<li>Report any suspected fraud or unauthorized activity immediately.</li>
</ul>

<h3>7. Compliance and Updates</h3>
<ul>
<li>This Policy complies with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, and other applicable laws.</li>
<li>We may update this Policy; changes will be posted here. Continued use constitutes acceptance.</li>
</ul>

<p>For queries, contact <a href="mailto:support@uparwala.in">support@uparwala.in</a> or call +91-XXXXXXXXXX.</p>

<p><em><strong>Note:</strong> While We strive for maximum security, no system is infallible. Users use the Platform at their own risk.</em></p>
"""

        page, created = CMSPage.objects.update_or_create(
            slug='security',
            defaults={
                'title': 'Security Policy',
                'content': security_content.strip(),
                'meta_title': 'Security Policy - Uparwala',
                'meta_description': 'Learn about the security measures Uparwala implements to protect your data, payments, and account.',
                'is_published': True,
                'published_at': timezone.now(),
            }
        )

        if created:
            self.stdout.write(self.style.SUCCESS(f'Created CMS page: {page.title}'))
        else:
            self.stdout.write(self.style.SUCCESS(f'Updated CMS page: {page.title}'))

        # Corporate Information Page
        corporate_content = """
<h2>Corporate Information</h2>
<p><strong>About Uparwala Traders LLP</strong></p>
<p>Uparwala.in is operated by Uparwala Traders LLP, a company dedicated to providing high-quality religious products and services. We are committed to transparency, ethical business practices, and customer satisfaction.</p>

<h3>Registered Office Address</h3>
<address style="margin-bottom: 20px; font-style: normal;">
    <strong>Uparwala Traders LLP</strong><br>
    11, Kohinoor Society,<br>
    Vijay Nagar Road,<br>
    Naranpura,<br>
    Ahmedabad, 380013,<br>
    Gujarat, India
</address>

<h3>Contact Details</h3>
<ul>
    <li><strong>Telephone:</strong> <a href="tel:0448447878">044-8447878</a></li>
    <li><strong>Email:</strong> <a href="mailto:support@uparwala.in">support@uparwala.in</a></li>
</ul>

<h3>Company Identification</h3>
<ul>
    <li><strong>CIN (Corporate Identity Number):</strong> U51109KA2012PTC066107</li>
    <li><strong>Business Type:</strong> Limited Liability Partnership (LLP)</li>
</ul>

<h3>Our Mission</h3>
<p>To connect devotees with authentic spiritual products and support our vendor community through fair commerce.</p>
"""

        corp_page, created = CMSPage.objects.update_or_create(
            slug='corporate-information',
            defaults={
                'title': 'Corporate Information',
                'content': corporate_content.strip(),
                'meta_title': 'Corporate Information - Uparwala',
                'meta_description': 'Corporate details, registered address, and contact information for Uparwala Traders LLP.',
                'is_published': True,
                'published_at': timezone.now(),
            }
        )

        if created:
            self.stdout.write(self.style.SUCCESS(f'Created CMS page: {corp_page.title}'))
        else:
            self.stdout.write(self.style.SUCCESS(f'Updated CMS page: {corp_page.title}'))

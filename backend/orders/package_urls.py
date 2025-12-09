from django.urls import path
from .package_views import (
    list_packages,
    create_package,
    cancel_order_item,
    get_cancellable_items
)

urlpatterns = [
    # Package management
    path('<int:order_id>/packages/', list_packages, name='list-packages'),
    path('<int:order_id>/packages/create/', create_package, name='create-package'),
    
    # Partial cancellations
    path('items/<int:item_id>/cancel/', cancel_order_item, name='cancel-item'),
    path('<int:order_id>/cancellable-items/', get_cancellable_items, name='cancellable-items'),
]

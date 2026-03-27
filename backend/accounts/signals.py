"""
Accounts Signals
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, UserProfile


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Automatically create a UserProfile when a user is created
    """
    if created:
        UserProfile.objects.get_or_create(user=instance)


@receiver(post_save, sender=User)
def create_user_cart(sender, instance, created, **kwargs):
    """
    Automatically create a Cart when a user is created
    This ensures every user has an active cart for the e-commerce workflow
    """
    if created:
        # Import here to avoid circular imports
        # Try to create cart only if store app exists
        try:
            from store.models import Cart
            Cart.objects.get_or_create(user=instance, completed=False)
        except ImportError:
            # Store app not yet created, skip cart creation
            pass

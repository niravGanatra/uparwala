from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0015_shiprocketpincode_division_name'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AlterField(
            model_name='order',
            name='user',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='orders', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='order',
            name='guest_email',
            field=models.EmailField(blank=True, help_text='Email for guest orders', max_length=254),
        ),
        migrations.AddField(
            model_name='order',
            name='session_id',
            field=models.CharField(blank=True, db_index=True, help_text='Session ID for guest orders', max_length=40),
        ),
    ]

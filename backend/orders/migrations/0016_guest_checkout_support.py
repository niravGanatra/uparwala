from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0015_shiprocketpincode_division_name'),
    ]

    operations = [
        migrations.AlterField(
            model_name='order',
            name='user',
            field=models.ForeignKey(blank=True, null=True, on_delete=models.deletion.CASCADE, related_name='orders', to='users.customuser'),
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

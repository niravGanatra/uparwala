from django.db import migrations

def verify_all_emails(apps, schema_editor):
    try:
        EmailAddress = apps.get_model('account', 'EmailAddress')
        # Update all unverified emails to verified
        EmailAddress.objects.filter(verified=False).update(verified=True)
    except Exception as e:
        print(f"Skipping verification update: {e}")

class Migration(migrations.Migration):

    dependencies = [
        ('users', '0004_user_date_of_birth_user_gender_and_more'),
        # We assume account app is installed. If dependencies fail, user might need to adjust.
        # But usually 'account' is initialized before custom usermodels relying on it fully.
    ]

    operations = [
        migrations.RunPython(verify_all_emails, migrations.RunPython.noop),
    ]

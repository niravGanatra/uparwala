with open('backend/notifications/email_templates.py', 'r') as f:
    content = f.read()
content = content.replace('        },', '        }')
with open('backend/notifications/email_templates.py', 'w') as f:
    f.write(content)

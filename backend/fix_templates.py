import re

with open('notifications/email_templates.py', 'r') as f:
    content = f.read()

# Replace templates dict with if statements
# We look for lines that are exactly 8 spaces, then a quote, then the template name, then quote, colon, space, brace.
pattern = re.compile(r"^        '([a-zA-Z_]+)': {", re.MULTILINE)

def replacer(match):
    template_name = match.group(1)
    return f"    if template_name == '{template_name}':\n        return {{"

new_content = pattern.sub(replacer, content)

# Remove the opening `    templates = {`
new_content = new_content.replace("    templates = {\n", "")

# Remove the closing `    }\n    \n    return templates.get(template_name)`
new_content = new_content.replace("    }\n    \n    return templates.get(template_name)", "    return None")

with open('notifications/email_templates_fixed.py', 'w') as f:
    f.write(new_content)

print("Done writing to email_templates_fixed.py")

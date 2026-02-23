import re

with open('backend/notifications/email_templates.py', 'r') as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    if line.rstrip() == "    templates = {":
        continue
    if line.rstrip() == "    }" and i > len(lines) - 10:
        continue
    if line.rstrip() == "    return templates.get(template_name)" and i > len(lines) - 10:
        new_lines.append("    return None\n")
        continue

    match = re.match(r"^        '([a-zA-Z0-9_]+)': {$", line.rstrip())
    if match:
        template_name = match.group(1)
        new_lines.append(f"    if template_name == '{template_name}':\n")
        new_lines.append(f"        return {{\n")
    else:
        new_lines.append(line)

with open('backend/notifications/email_templates_fixed.py', 'w') as f:
    f.writelines(new_lines)
print("Done")

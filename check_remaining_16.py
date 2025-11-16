import re

# Read the HTML file
with open(r'c:\Users\hyper\Downloads\switch13-11.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

# Find all input buttons
button_pattern = r'<input\s+type=button[^>]*>'
button_matches = re.findall(button_pattern, html_content, re.IGNORECASE)

ip_pattern = r'(\d+\.\d+\.\d+\.\d+)'
devices_found = []
buttons_without_ip = []

for button_html in button_matches:
    value_match = re.search(r"value=['\"]([^'\"]*)['\"]", button_html, re.IGNORECASE)
    value = value_match.group(1) if value_match else ''
    
    title_match = re.search(r"title=['\"]([^'\"]*)['\"]", button_html, re.IGNORECASE)
    title = title_match.group(1) if title_match else ''
    
    onclick_match = re.search(r'onclick="([^"]*)"', button_html, re.IGNORECASE | re.DOTALL)
    onclick = onclick_match.group(1) if onclick_match else ''
    
    # Check for IP anywhere
    has_ip = False
    if re.search(ip_pattern, value) or re.search(ip_pattern, title) or re.search(ip_pattern, onclick):
        has_ip = True
        devices_found.append(value[:50] if value else title[:50])
    else:
        buttons_without_ip.append({
            'value': value,
            'title': title,
            'class': re.search(r"class=['\"]([^'\"]*)['\"]", button_html, re.IGNORECASE).group(1) if re.search(r"class=['\"]([^'\"]*)['\"]", button_html, re.IGNORECASE) else '',
            'has_showInfo': 'showInfo' in onclick
        })

print(f"Total buttons: {len(button_matches)}")
print(f"Buttons with IPs: {len(devices_found)}")
print(f"Buttons without IPs: {len(buttons_without_ip)}")
print("\n" + "=" * 80)
print("REMAINING BUTTONS WITHOUT IP ADDRESSES:")
print("=" * 80)
for i, btn in enumerate(buttons_without_ip, 1):
    print(f"\n{i}. Value: '{btn['value']}'")
    print(f"   Title: '{btn['title']}'")
    print(f"   Class: '{btn['class']}'")
    print(f"   Has showInfo: {btn['has_showInfo']}")


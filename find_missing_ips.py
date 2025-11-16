import re

# Read the HTML file
with open(r'c:\Users\hyper\Downloads\switch13-11.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

# Find all input buttons
button_pattern = r'<input\s+type=button[^>]*>'
button_matches = re.findall(button_pattern, html_content, re.IGNORECASE)

ip_pattern = r'(\d+\.\d+\.\d+\.\d+)'
devices_with_ip = []
devices_without_ip = []

for button_html in button_matches:
    # Extract value
    value_match = re.search(r"value=['\"]([^'\"]*)['\"]", button_html, re.IGNORECASE)
    value = value_match.group(1) if value_match else ''
    
    # Extract title
    title_match = re.search(r"title=['\"]([^'\"]*)['\"]", button_html, re.IGNORECASE)
    title = title_match.group(1) if title_match else ''
    
    # Extract onclick
    onclick_match = re.search(r'onclick="([^"]*)"', button_html, re.IGNORECASE)
    if not onclick_match:
        onclick_match = re.search(r"onclick='([^']*)'", button_html, re.IGNORECASE)
    onclick = onclick_match.group(1) if onclick_match else ''
    
    # Check for IP anywhere
    has_ip = False
    device_name = value or title or 'Unknown'
    
    # Check value
    if value and re.search(ip_pattern, value):
        has_ip = True
    # Check title
    elif title and re.search(ip_pattern, title):
        has_ip = True
    # Check onclick
    elif onclick and re.search(ip_pattern, onclick):
        has_ip = True
    
    if has_ip:
        devices_with_ip.append(device_name[:50])
    else:
        devices_without_ip.append({
            'value': value[:60],
            'title': title[:60],
            'has_onclick': 'showInfo' in onclick if onclick else False
        })

print(f"Total buttons: {len(button_matches)}")
print(f"Buttons with IP: {len(devices_with_ip)}")
print(f"Buttons without IP: {len(devices_without_ip)}")
print("\n" + "="*80)
print("BUTTONS WITHOUT IP ADDRESSES:")
print("="*80)
for i, device in enumerate(devices_without_ip[:33], 1):
    print(f"\n{i}. Value: {device['value']}")
    print(f"   Title: {device['title']}")
    print(f"   Has showInfo: {device['has_onclick']}")


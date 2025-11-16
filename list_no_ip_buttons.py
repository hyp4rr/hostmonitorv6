import re

# Read the HTML file
with open(r'c:\Users\hyper\Downloads\switch13-11.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

# Find all input buttons
button_pattern = r'<input\s+type=button[^>]*>'
button_matches = re.findall(button_pattern, html_content, re.IGNORECASE)

ip_pattern = r'(\d+\.\d+\.\d+\.\d+)'
buttons_without_ip = []

print("=" * 80)
print("BUTTONS WITHOUT IP ADDRESSES")
print("=" * 80)
print()

for i, button_html in enumerate(button_matches, 1):
    # Extract value
    value_match = re.search(r"value=['\"]([^'\"]*)['\"]", button_html, re.IGNORECASE)
    value = value_match.group(1) if value_match else ''
    
    # Extract title
    title_match = re.search(r"title=['\"]([^'\"]*)['\"]", button_html, re.IGNORECASE)
    title = title_match.group(1) if title_match else ''
    
    # Extract onclick
    onclick_match = re.search(r'onclick="([^"]*)"', button_html, re.IGNORECASE | re.DOTALL)
    onclick = onclick_match.group(1) if onclick_match else ''
    
    # Extract class
    class_match = re.search(r"class=['\"]([^'\"]*)['\"]", button_html, re.IGNORECASE)
    button_class = class_match.group(1) if class_match else ''
    
    # Check for IP in value, title, or onclick
    has_ip_in_value = bool(re.search(ip_pattern, value)) if value else False
    has_ip_in_title = bool(re.search(ip_pattern, title)) if title else False
    has_ip_in_onclick = bool(re.search(ip_pattern, onclick)) if onclick else False
    
    has_ip = has_ip_in_value or has_ip_in_title or has_ip_in_onclick
    
    if not has_ip:
        # Try to extract device name
        device_name = value or title or 'Unknown'
        
        # Check if it has showInfo (indicates it's a device, not UI)
        has_showInfo = 'showInfo' in onclick if onclick else False
        
        buttons_without_ip.append({
            'index': i,
            'device_name': device_name,
            'value': value,
            'title': title,
            'class': button_class,
            'has_showInfo': has_showInfo,
            'onclick_preview': onclick[:150] if onclick else 'No onclick'
        })

print(f"Total buttons found: {len(button_matches)}")
print(f"Buttons without IP addresses: {len(buttons_without_ip)}")
print()

# Categorize them
devices_without_ip = [b for b in buttons_without_ip if b['has_showInfo']]
ui_buttons = [b for b in buttons_without_ip if not b['has_showInfo']]

print("=" * 80)
print("DEVICES WITHOUT IP (have showInfo but no IP found)")
print("=" * 80)
print(f"Count: {len(devices_without_ip)}")
print()

if devices_without_ip:
    for btn in devices_without_ip:
        print(f"{btn['index']:3}. {btn['device_name']}")
        print(f"     Value: {btn['value'][:60]}")
        print(f"     Title: {btn['title'][:60]}")
        print(f"     Class: {btn['class']}")
        print(f"     Onclick: {btn['onclick_preview'][:100]}...")
        print()
else:
    print("  None found")

print()
print("=" * 80)
print("UI BUTTONS WITHOUT IP (likely not devices)")
print("=" * 80)
print(f"Count: {len(ui_buttons)}")
print()

if ui_buttons:
    for btn in ui_buttons:
        print(f"{btn['index']:3}. {btn['device_name']}")
        print(f"     Value: '{btn['value']}'")
        print(f"     Title: '{btn['title']}'")
        print(f"     Class: {btn['class']}")
        print()
else:
    print("  None found")

# Write to file
with open('buttons_without_ip.txt', 'w', encoding='utf-8') as f:
    f.write("BUTTONS WITHOUT IP ADDRESSES\n")
    f.write("=" * 80 + "\n\n")
    f.write(f"Total: {len(buttons_without_ip)} buttons\n\n")
    
    f.write("DEVICES WITHOUT IP (have showInfo):\n")
    f.write("-" * 80 + "\n")
    for btn in devices_without_ip:
        f.write(f"\nButton #{btn['index']}:\n")
        f.write(f"  Device Name: {btn['device_name']}\n")
        f.write(f"  Value: {btn['value']}\n")
        f.write(f"  Title: {btn['title']}\n")
        f.write(f"  Class: {btn['class']}\n")
        f.write(f"  Onclick: {btn['onclick_preview']}\n")
    
    f.write("\n\nUI BUTTONS WITHOUT IP:\n")
    f.write("-" * 80 + "\n")
    for btn in ui_buttons:
        f.write(f"\nButton #{btn['index']}:\n")
        f.write(f"  Value: {btn['value']}\n")
        f.write(f"  Title: {btn['title']}\n")
        f.write(f"  Class: {btn['class']}\n")

print(f"\nDetailed list saved to: buttons_without_ip.txt")


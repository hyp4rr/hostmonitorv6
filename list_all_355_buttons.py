import re
import csv

# Read the HTML file
with open(r'c:\Users\hyper\Downloads\switch13-11.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

# Find all input buttons
button_pattern = r'<input\s+type=button[^>]*>'
button_matches = re.findall(button_pattern, html_content, re.IGNORECASE)

# Read extracted devices
extracted_ips = set()
with open('all_355_devices_complete.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        extracted_ips.add(row['ip_address'])

ip_pattern = r'(\d+\.\d+\.\d+\.\d+)'
ui_button_ids = {'btn1g', 'btn2b', 'btn3u', 'jsBtnOk'}

print("=" * 80)
print("ALL 355 BUTTONS - COMPLETE LIST")
print("=" * 80)
print()

devices_with_ip = []
devices_without_ip = []
ui_buttons_list = []

for i, button_html in enumerate(button_matches, 1):
    # Extract id
    id_match = re.search(r'id=["\']([^"\']*)["\']', button_html, re.IGNORECASE)
    button_id = id_match.group(1) if id_match else ''
    
    # Extract value
    value_match = re.search(r"value=['\"]([^'\"]*)['\"]", button_html, re.IGNORECASE)
    value = value_match.group(1) if value_match else ''
    
    # Extract title
    title_match = re.search(r"title=['\"]([^'\"]*)['\"]", button_html, re.IGNORECASE)
    title = title_match.group(1) if title_match else ''
    
    device_name = value or title or f"Button {i}"
    
    # Check if UI button
    if button_id in ui_button_ids:
        ui_buttons_list.append({
            'index': i,
            'id': button_id,
            'name': device_name,
            'type': 'UI Button'
        })
        continue
    
    # Check for IP anywhere
    has_ip = False
    ip_address = None
    
    # Check value
    if value and re.search(ip_pattern, value):
        ip_match = re.search(ip_pattern, value)
        ip_address = ip_match.group(1)
        has_ip = True
    
    # Check title
    if not has_ip and title and re.search(ip_pattern, title):
        ip_match = re.search(ip_pattern, title)
        ip_address = ip_match.group(1)
        has_ip = True
    
    # Check onclick
    onclick_match = re.search(r'onclick="([^"]*)"', button_html, re.IGNORECASE | re.DOTALL)
    onclick = onclick_match.group(1) if onclick_match else ''
    
    if not has_ip and onclick:
        ip_match = re.search(r'Ping[:\s]+' + ip_pattern, onclick, re.IGNORECASE)
        if ip_match:
            ip_address = ip_match.group(1)
            has_ip = True
        else:
            ip_match = re.search(ip_pattern, onclick)
            if ip_match:
                ip_address = ip_match.group(1)
                has_ip = True
    
    if has_ip and ip_address:
        devices_with_ip.append({
            'index': i,
            'name': device_name,
            'ip': ip_address,
            'in_extracted': ip_address in extracted_ips
        })
    else:
        devices_without_ip.append({
            'index': i,
            'name': device_name,
            'value': value,
            'title': title,
            'has_onclick': bool(onclick)
        })

print(f"Total buttons: {len(button_matches)}")
print(f"UI buttons: {len(ui_buttons_list)}")
print(f"Devices with IPs: {len(devices_with_ip)}")
print(f"Devices without IPs: {len(devices_without_ip)}")
print()

print("=" * 80)
print("UI BUTTONS (NOT devices):")
print("=" * 80)
for btn in ui_buttons_list:
    print(f"  {btn['index']:3}. {btn['id']:<10} - {btn['name']}")

print()
print("=" * 80)
print(f"DEVICES WITHOUT IPs ({len(devices_without_ip)} buttons):")
print("=" * 80)
for btn in devices_without_ip:
    print(f"  {btn['index']:3}. {btn['name']:<50} Has onclick: {btn['has_onclick']}")

print()
print("=" * 80)
print("SUMMARY")
print("=" * 80)
print(f"Total buttons: {len(button_matches)}")
print(f"UI buttons (excluded): {len(ui_buttons_list)}")
print(f"Device buttons: {len(button_matches) - len(ui_buttons_list)}")
print(f"Devices with IPs found: {len(devices_with_ip)}")
print(f"Devices without IPs: {len(devices_without_ip)}")
print()
print(f"If counting ALL buttons as devices: {len(button_matches)}")
print(f"If excluding UI buttons: {len(button_matches) - len(ui_buttons_list)}")
print(f"Devices with IPs extracted: {len(extracted_ips)}")


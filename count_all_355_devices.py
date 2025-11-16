import re
import csv
from collections import defaultdict

# Read the HTML file
with open(r'c:\Users\hyper\Downloads\switch13-11.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

# Find all input buttons
button_pattern = r'<input\s+type=button[^>]*>'
button_matches = re.findall(button_pattern, html_content, re.IGNORECASE)

print(f"Total buttons found: {len(button_matches)}\n")

ip_pattern = r'(\d+\.\d+\.\d+\.\d+)'
all_devices = []
ui_buttons = []

for i, button_html in enumerate(button_matches, 1):
    # Extract value
    value_match = re.search(r"value=['\"]([^'\"]*)['\"]", button_html, re.IGNORECASE)
    value = value_match.group(1) if value_match else ''
    
    # Extract title
    title_match = re.search(r"title=['\"]([^'\"]*)['\"]", button_html, re.IGNORECASE)
    title = title_match.group(1) if title_match else ''
    
    # Extract id (to identify UI buttons)
    id_match = re.search(r'id=["\']([^"\']*)["\']', button_html, re.IGNORECASE)
    button_id = id_match.group(1) if id_match else ''
    
    # Extract onclick
    onclick_match = re.search(r'onclick="([^"]*)"', button_html, re.IGNORECASE | re.DOTALL)
    onclick = onclick_match.group(1) if onclick_match else ''
    
    # Check if it's a UI button (stats buttons or popup button)
    is_ui_button = button_id in ['btn1g', 'btn2b', 'btn3u', 'jsBtnOk'] or value.strip() == ''
    
    device_name = None
    ip_address = None
    
    # Try to extract from onclick showInfo
    if onclick and 'showInfo' in onclick:
        showinfo_match = re.search(r"showInfo\('([^']*)',\s*'([^']*)'\)", onclick, re.IGNORECASE | re.DOTALL)
        if showinfo_match:
            device_name = showinfo_match.group(1)
            info_content = showinfo_match.group(2)
            ip_match = re.search(r'Ping[:\s]+' + ip_pattern, info_content, re.IGNORECASE)
            if ip_match:
                ip_address = ip_match.group(1)
    
    # Fallback: use value/title
    if not device_name:
        device_name = value or title
    
    if not ip_address:
        # Try value
        if value:
            ping_match = re.search(r'Ping:\s*' + ip_pattern, value, re.IGNORECASE)
            if ping_match:
                ip_address = ping_match.group(1)
                device_name = value.split('Ping:')[0].strip()
            else:
                ip_at_end = re.search(r'\s+' + ip_pattern + r'$', value)
                if ip_at_end:
                    ip_address = ip_at_end.group(1)
                    device_name = value.replace(ip_address, '').strip()
                else:
                    ip_embedded = re.search(ip_pattern, value)
                    if ip_embedded:
                        ip_address = ip_embedded.group(1)
                        device_name = value.replace(ip_address, '').strip().rstrip('-')
        
        # Try title
        if not ip_address and title:
            ping_match = re.search(r'Ping:\s*' + ip_pattern, title, re.IGNORECASE)
            if ping_match:
                ip_address = ping_match.group(1)
                if not device_name:
                    device_name = title.split('Ping:')[0].strip()
            else:
                ip_at_end = re.search(r'\s+' + ip_pattern + r'$', title)
                if ip_at_end:
                    ip_address = ip_at_end.group(1)
                    if not device_name:
                        device_name = title.replace(ip_address, '').strip()
                else:
                    ip_embedded = re.search(ip_pattern, title)
                    if ip_embedded:
                        ip_address = ip_embedded.group(1)
                        if not device_name:
                            device_name = title.replace(ip_address, '').strip().rstrip('-')
        
        # Last resort: look for any IP in onclick
        if not ip_address and onclick:
            ip_match = re.search(r'Ping[:\s]+' + ip_pattern, onclick, re.IGNORECASE)
            if ip_match:
                ip_address = ip_match.group(1)
            else:
                # Try any IP pattern in onclick
                ip_match = re.search(ip_pattern, onclick)
                if ip_match:
                    ip_address = ip_match.group(1)
    
    # Clean up device name
    if device_name:
        device_name = device_name.replace('&amp;', '&')
        device_name = re.sub(r'\s+Ping:?\s*$', '', device_name, flags=re.IGNORECASE)
        device_name = re.sub(r'\s+' + ip_pattern + r'$', '', device_name)
        device_name = device_name.strip()
    
    # Categorize
    if is_ui_button:
        ui_buttons.append({
            'index': i,
            'id': button_id,
            'value': value,
            'title': title
        })
    elif device_name and ip_address:
        all_devices.append({
            'device_name': device_name,
            'ip_address': ip_address,
            'index': i
        })
    else:
        # Button without IP - might be a device we're missing
        print(f"Button {i} without IP: {device_name} (Value: '{value}', Title: '{title}')")

# Count unique devices by IP
seen_ips = {}
unique_devices = []
for device in all_devices:
    ip = device['ip_address']
    if ip not in seen_ips:
        seen_ips[ip] = device['device_name']
        unique_devices.append(device)
    else:
        # Duplicate IP - check if it's a different name
        if seen_ips[ip] != device['device_name']:
            print(f"Duplicate IP {ip}: '{seen_ips[ip]}' vs '{device['device_name']}'")

# Sort by IP
unique_devices.sort(key=lambda x: tuple(map(int, x['ip_address'].split('.'))))

print("\n" + "=" * 80)
print("FINAL COUNT")
print("=" * 80)
print(f"Total buttons in HTML: {len(button_matches)}")
print(f"UI buttons (stats/popup): {len(ui_buttons)}")
print(f"Total devices found: {len(all_devices)}")
print(f"Unique devices (by IP): {len(unique_devices)}")
print()

print("UI Buttons:")
for btn in ui_buttons:
    print(f"  {btn['index']:3}. ID: {btn['id']:<10} Title: {btn['title']}")

print()
print("=" * 80)
print("BREAKDOWN")
print("=" * 80)
print(f"Total buttons: {len(button_matches)}")
print(f"  - UI buttons: {len(ui_buttons)}")
print(f"  - Device buttons: {len(all_devices)}")
print(f"  - Unique device IPs: {len(unique_devices)}")
print()
print(f"If you count ALL buttons as devices: {len(button_matches)}")
print(f"If you count only actual network devices: {len(unique_devices)}")
print(f"If you count all device entries (including duplicates): {len(all_devices)}")

# Write all devices
output_file = 'all_355_devices.csv'
with open(output_file, 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['device_name', 'ip_address', 'button_index'])
    writer.writeheader()
    for device in sorted(unique_devices, key=lambda x: x['index']):
        writer.writerow({
            'device_name': device['device_name'],
            'ip_address': device['ip_address'],
            'button_index': device['index']
        })

print(f"\nAll unique devices saved to: {output_file}")


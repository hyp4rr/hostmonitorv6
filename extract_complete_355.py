import re
import csv

# Read the HTML file
with open(r'c:\Users\hyper\Downloads\switch13-11.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

# Find all input buttons
button_pattern = r'<input\s+type=button[^>]*>'
button_matches = re.findall(button_pattern, html_content, re.IGNORECASE)

ip_pattern = r'(\d+\.\d+\.\d+\.\d+)'
all_devices = []
ui_button_ids = {'btn1g', 'btn2b', 'btn3u', 'jsBtnOk'}

print(f"Processing {len(button_matches)} buttons...\n")

for i, button_html in enumerate(button_matches, 1):
    # Extract id
    id_match = re.search(r'id=["\']([^"\']*)["\']', button_html, re.IGNORECASE)
    button_id = id_match.group(1) if id_match else ''
    
    # Skip UI buttons
    if button_id in ui_button_ids:
        continue
    
    # Extract value
    value_match = re.search(r"value=['\"]([^'\"]*)['\"]", button_html, re.IGNORECASE)
    value = value_match.group(1) if value_match else ''
    
    # Extract title
    title_match = re.search(r"title=['\"]([^'\"]*)['\"]", button_html, re.IGNORECASE)
    title = title_match.group(1) if title_match else ''
    
    # Extract onclick - use a more robust method
    onclick = ''
    # Find onclick="..." - handle escaped quotes
    onclick_pattern = r'onclick="((?:[^"\\]|\\.)*)"'
    onclick_match = re.search(onclick_pattern, button_html, re.IGNORECASE | re.DOTALL)
    if onclick_match:
        onclick = onclick_match.group(1)
    
    device_name = None
    ip_address = None
    
    # PRIORITY 1: Extract from onclick showInfo (most reliable)
    if onclick and 'showInfo' in onclick:
        # Extract showInfo('name','info')
        showinfo_match = re.search(r"showInfo\('([^']*)',\s*'([^']*)'\)", onclick, re.IGNORECASE | re.DOTALL)
        if showinfo_match:
            device_name = showinfo_match.group(1)
            info_content = showinfo_match.group(2)
            # Look for IP after "Ping: " or "Ping "
            ip_match = re.search(r'Ping[:\s]+' + ip_pattern, info_content, re.IGNORECASE)
            if ip_match:
                ip_address = ip_match.group(1)
    
    # PRIORITY 2: Extract from value/title if not found in onclick
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
        
        # PRIORITY 3: Look for any IP in onclick (fallback)
        if not ip_address and onclick:
            ip_match = re.search(r'Ping[:\s]+' + ip_pattern, onclick, re.IGNORECASE)
            if ip_match:
                ip_address = ip_match.group(1)
            else:
                # Last resort: any IP in onclick
                ip_match = re.search(ip_pattern, onclick)
                if ip_match:
                    ip_address = ip_match.group(1)
    
    # Clean up device name
    if device_name:
        device_name = device_name.replace('&amp;', '&')
        device_name = re.sub(r'\s+Ping:?\s*$', '', device_name, flags=re.IGNORECASE)
        device_name = re.sub(r'\s+' + ip_pattern + r'$', '', device_name)
        device_name = device_name.strip()
    
    # Add device if we have both name and IP
    if device_name and ip_address:
        all_devices.append({
            'device_name': device_name,
            'ip_address': ip_address,
            'button_index': i
        })
    else:
        # This shouldn't happen if all buttons are devices
        print(f"WARNING: Button {i} missing IP - Name: {device_name}, Value: {value[:30]}")

# Remove duplicates based on IP (keep first occurrence)
seen_ips = {}
unique_devices = []
duplicate_count = 0

for device in all_devices:
    ip = device['ip_address']
    if ip not in seen_ips:
        seen_ips[ip] = device['device_name']
        unique_devices.append(device)
    else:
        duplicate_count += 1
        # Check if it's a different name
        if seen_ips[ip] != device['device_name']:
            print(f"Duplicate IP {ip}: '{seen_ips[ip]}' vs '{device['device_name']}'")

# Sort by button index
unique_devices.sort(key=lambda x: x['button_index'])

print("\n" + "=" * 80)
print("FINAL COUNT - COMPLETE EXTRACTION")
print("=" * 80)
print(f"Total buttons in HTML: {len(button_matches)}")
print(f"UI buttons excluded: 4 (btn1g, btn2b, btn3u, jsBtnOk)")
print(f"Device buttons processed: {len(button_matches) - 4}")
print(f"Devices with IPs extracted: {len(all_devices)}")
print(f"Unique devices (by IP): {len(unique_devices)}")
print(f"Duplicate entries: {duplicate_count}")
print()
print(f"Total device buttons: {len(button_matches) - 4} = {len(button_matches) - 4}")
print(f"Devices successfully extracted: {len(unique_devices)}")
print(f"Missing: {(len(button_matches) - 4) - len(unique_devices)}")

# Write to CSV
output_file = 'all_devices_complete.csv'
with open(output_file, 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['device_name', 'ip_address'])
    writer.writeheader()
    for device in unique_devices:
        writer.writerow({
            'device_name': device['device_name'],
            'ip_address': device['ip_address']
        })

print(f"\nAll devices saved to: {output_file}")


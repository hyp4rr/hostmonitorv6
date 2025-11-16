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
    
    # Extract onclick - FIXED: handle the full onclick attribute properly
    onclick = ''
    # The onclick is: onclick="javascript:showInfo('name','info with Ping: IP')"
    # We need to extract everything between onclick=" and the matching closing "
    onclick_start = button_html.find('onclick="')
    if onclick_start != -1:
        # Find the matching closing quote (not escaped)
        start_idx = onclick_start + 9  # After onclick="
        end_idx = start_idx
        while end_idx < len(button_html):
            if button_html[end_idx] == '"' and (end_idx == 0 or button_html[end_idx-1] != '\\'):
                onclick = button_html[start_idx:end_idx]
                break
            end_idx += 1
    
    device_name = None
    ip_address = None
    
    # Extract from onclick showInfo
    if onclick and 'showInfo' in onclick:
        # showInfo('name','info')
        showinfo_match = re.search(r"showInfo\('([^']*)',\s*'([^']*)'\)", onclick, re.IGNORECASE | re.DOTALL)
        if showinfo_match:
            device_name = showinfo_match.group(1)
            info_content = showinfo_match.group(2)
            # Look for IP
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
        
        # Last resort: any IP in onclick
        if not ip_address and onclick:
            ip_match = re.search(r'Ping[:\s]+' + ip_pattern, onclick, re.IGNORECASE)
            if ip_match:
                ip_address = ip_match.group(1)
            else:
                # Any IP in onclick
                ip_match = re.search(ip_pattern, onclick)
                if ip_match:
                    ip_address = ip_match.group(1)
    
    # Clean up device name
    if device_name:
        device_name = device_name.replace('&amp;', '&')
        device_name = re.sub(r'\s+Ping:?\s*$', '', device_name, flags=re.IGNORECASE)
        device_name = re.sub(r'\s+' + ip_pattern + r'$', '', device_name)
        device_name = device_name.strip()
    
    # Add device
    if device_name and ip_address:
        all_devices.append({
            'device_name': device_name,
            'ip_address': ip_address,
            'button_index': i
        })
    else:
        # Debug missing ones
        print(f"Button {i} - Name: {device_name}, IP: {ip_address}, Has onclick: {bool(onclick)}")

# Remove duplicates by IP
seen_ips = {}
unique_devices = []
for device in all_devices:
    ip = device['ip_address']
    if ip not in seen_ips:
        seen_ips[ip] = device['device_name']
        unique_devices.append(device)

unique_devices.sort(key=lambda x: x['button_index'])

print("\n" + "=" * 80)
print("FINAL COUNT")
print("=" * 80)
print(f"Total buttons: {len(button_matches)}")
print(f"UI buttons (excluded): 4")
print(f"Device buttons: {len(button_matches) - 4}")
print(f"Devices extracted: {len(unique_devices)}")
print(f"Missing: {(len(button_matches) - 4) - len(unique_devices)}")

# Write to CSV
output_file = 'all_devices_final.csv'
with open(output_file, 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['device_name', 'ip_address'])
    writer.writeheader()
    for device in unique_devices:
        writer.writerow({
            'device_name': device['device_name'],
            'ip_address': device['ip_address']
        })

print(f"\nSaved to: {output_file}")


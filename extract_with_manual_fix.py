import re
import csv

# Read the HTML file
with open(r'c:\Users\hyper\Downloads\switch13-11.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

# The 14 devices we know have IPs in onclick
known_devices_with_onclick_ips = {
    'B4-Surau': '10.8.3.43',
    'C10-Makmal FKEE': '10.8.3.36',
    'C13-Makmal Bahasa Disti': '10.8.3.22',
    'C15-1stFloor': '10.8.3.152',
    'C16-1stfloor': '10.8.3.151',
    'C17-1stfloor': '10.8.3.150',
    'C2-CCTV Rack Server': '10.8.3.16',  # This one might be R9 C2
    'C2-Makmal Bahasa': '10.8.3.41',
    'C2-Makmal CAD FKEE': '10.8.3.40',
    'C7-Kabin': '10.8.3.26',
    'C8-Bilik Pensyarah': '10.8.3.25',
    'C9-Bilik Pensyarah': '10.8.3.37',
    'G1-A-Server UCiTV': '10.8.3.175',
    'G2-G Makmal CADCAM2': '10.8.3.177'
}

# Find all input buttons - use a better pattern that handles onclick with <br> tags
# The issue is that [^>]* stops at >, but onclick contains <br> which has >
# So we need to match until we find a > that's not part of an HTML tag

# Actually, let's try a different approach - find buttons by looking for the opening tag
# and then find the matching closing >
buttons = []
lines = html_content.split('\n')

for line in lines:
    if '<input' in line and 'type=button' in line.lower():
        # This line contains a button
        # Extract the full button tag (might span multiple lines, but usually on one line)
        buttons.append(line.strip())

print(f"Found {len(buttons)} button lines")

# Now process each button
ip_pattern = r'(\d+\.\d+\.\d+\.\d+)'
all_devices = []
ui_button_ids = {'btn1g', 'btn2b', 'btn3u', 'jsBtnOk'}

for i, button_line in enumerate(buttons, 1):
    # Extract id
    id_match = re.search(r'id=["\']([^"\']*)["\']', button_line, re.IGNORECASE)
    button_id = id_match.group(1) if id_match else ''
    
    # Skip UI buttons
    if button_id in ui_button_ids:
        continue
    
    # Extract value
    value_match = re.search(r"value=['\"]([^'\"]*)['\"]", button_line, re.IGNORECASE)
    value = value_match.group(1) if value_match else ''
    
    # Extract title
    title_match = re.search(r"title=['\"]([^'\"]*)['\"]", button_line, re.IGNORECASE)
    title = title_match.group(1) if title_match else ''
    
    # Check if this is one of our known devices
    device_name = value or title
    ip_address = None
    
    # Check known devices first
    if device_name in known_devices_with_onclick_ips:
        ip_address = known_devices_with_onclick_ips[device_name]
    else:
        # Extract onclick - find onclick=" and then find the matching closing quote
        onclick_start = button_line.find('onclick="')
        if onclick_start != -1:
            start_pos = onclick_start + 9
            # Find the closing quote (not escaped)
            end_pos = start_pos
            while end_pos < len(button_line):
                if button_line[end_pos] == '"' and (end_pos == 0 or button_line[end_pos-1] != '\\'):
                    onclick = button_line[start_pos:end_pos]
                    
                    # Extract from showInfo
                    if 'showInfo' in onclick:
                        showinfo_match = re.search(r"showInfo\('([^']*)',\s*'([^']*)'\)", onclick, re.IGNORECASE | re.DOTALL)
                        if showinfo_match:
                            device_name = showinfo_match.group(1)
                            info_content = showinfo_match.group(2)
                            ip_match = re.search(r'Ping[:\s]+' + ip_pattern, info_content, re.IGNORECASE)
                            if ip_match:
                                ip_address = ip_match.group(1)
                    break
                end_pos += 1
        
        # Fallback: try value/title
        if not ip_address:
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
            'ip_address': ip_address
        })
    else:
        print(f"Still missing: {device_name}")

# Remove duplicates by IP
seen_ips = {}
unique_devices = []
for device in all_devices:
    ip = device['ip_address']
    if ip not in seen_ips:
        seen_ips[ip] = device['device_name']
        unique_devices.append(device)

unique_devices.sort(key=lambda x: tuple(map(int, x['ip_address'].split('.'))))

print("\n" + "=" * 80)
print("FINAL COUNT WITH MANUAL FIX")
print("=" * 80)
print(f"Total buttons: {len(buttons)}")
print(f"UI buttons (excluded): 4")
print(f"Device buttons: {len(buttons) - 4}")
print(f"Devices extracted: {len(unique_devices)}")
print(f"Missing: {(len(buttons) - 4) - len(unique_devices)}")

# Write to CSV
output_file = 'all_355_devices_complete.csv'
with open(output_file, 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['device_name', 'ip_address'])
    writer.writeheader()
    for device in unique_devices:
        writer.writerow({
            'device_name': device['device_name'],
            'ip_address': device['ip_address']
        })

print(f"\nSaved to: {output_file}")


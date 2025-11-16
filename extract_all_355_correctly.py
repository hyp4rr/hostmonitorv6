import re
import csv

# Read the HTML file
with open(r'c:\Users\hyper\Downloads\switch13-11.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

# Find all input buttons - read line by line to get full onclick
lines = html_content.split('\n')
button_lines = []
current_button = ""

for line in lines:
    if '<input' in line and 'type=button' in line.lower():
        # Check if button tag is complete on this line
        if line.strip().endswith('>'):
            button_lines.append(line)
        else:
            # Multi-line button, start collecting
            current_button = line
    elif current_button:
        # Continue collecting multi-line button
        current_button += line
        if '>' in line:
            button_lines.append(current_button)
            current_button = ""

# Also try the regex method as backup
button_pattern = r'<input\s+type=button[^>]*>'
button_matches_regex = re.findall(button_pattern, html_content, re.IGNORECASE)

print(f"Buttons found (line-by-line): {len(button_lines)}")
print(f"Buttons found (regex): {len(button_matches_regex)}")
print()

# Use the method that found more
if len(button_lines) >= len(button_matches_regex):
    button_matches = button_lines
    print("Using line-by-line method")
else:
    button_matches = button_matches_regex
    print("Using regex method")

ip_pattern = r'(\d+\.\d+\.\d+\.\d+)'
all_devices = []

for i, button_html in enumerate(button_matches, 1):
    # Extract value
    value_match = re.search(r"value=['\"]([^'\"]*)['\"]", button_html, re.IGNORECASE)
    value = value_match.group(1) if value_match else ''
    
    # Extract title
    title_match = re.search(r"title=['\"]([^'\"]*)['\"]", button_html, re.IGNORECASE)
    title = title_match.group(1) if title_match else ''
    
    # Extract id
    id_match = re.search(r'id=["\']([^"\']*)["\']', button_html, re.IGNORECASE)
    button_id = id_match.group(1) if id_match else ''
    
    # Skip UI buttons
    if button_id in ['btn1g', 'btn2b', 'btn3u', 'jsBtnOk']:
        continue
    
    # Extract onclick - get the FULL onclick including across lines
    onclick = ''
    # Try to find onclick="..." - handle multi-line
    onclick_start = button_html.find('onclick="')
    if onclick_start != -1:
        # Find the closing quote
        start_pos = onclick_start + 9  # After onclick="
        quote_count = 0
        pos = start_pos
        while pos < len(button_html):
            if button_html[pos] == '"' and button_html[pos-1] != '\\':
                onclick = button_html[start_pos:pos]
                break
            pos += 1
    
    device_name = None
    ip_address = None
    
    # Try to extract from onclick showInfo
    if onclick and 'showInfo' in onclick:
        showinfo_match = re.search(r"showInfo\('([^']*)',\s*'([^']*)'\)", onclick, re.IGNORECASE | re.DOTALL)
        if showinfo_match:
            device_name = showinfo_match.group(1)
            info_content = showinfo_match.group(2)
            # Look for IP - try multiple patterns
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
    
    # Only add if we have both name and IP
    if device_name and ip_address:
        all_devices.append({
            'device_name': device_name,
            'ip_address': ip_address,
            'button_index': i
        })
    else:
        # Debug: show what we're missing
        if value or title:
            print(f"Button {i} missing IP: {device_name}")

# Remove duplicates based on IP (keep first occurrence)
seen_ips = {}
unique_devices = []
for device in all_devices:
    ip = device['ip_address']
    if ip not in seen_ips:
        seen_ips[ip] = device['device_name']
        unique_devices.append(device)
    else:
        # Check if it's a different name (duplicate IP)
        if seen_ips[ip] != device['device_name']:
            print(f"Duplicate IP {ip}: '{seen_ips[ip]}' vs '{device['device_name']}'")

# Sort by button index
unique_devices.sort(key=lambda x: x['button_index'])

print("\n" + "=" * 80)
print("FINAL COUNT - ALL 355 BUTTONS")
print("=" * 80)
print(f"Total buttons in HTML: {len(button_matches)}")
print(f"UI buttons (excluded): 4 (btn1g, btn2b, btn3u, jsBtnOk)")
print(f"Device buttons extracted: {len(all_devices)}")
print(f"Unique devices (by IP): {len(unique_devices)}")
print()
print(f"Total devices if counting all buttons: {len(button_matches)}")
print(f"Total devices if excluding UI buttons: {len(button_matches) - 4} = {len(button_matches) - 4}")
print(f"Total devices with IPs extracted: {len(unique_devices)}")

# Write to CSV
output_file = 'all_355_devices_final.csv'
with open(output_file, 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['device_name', 'ip_address'])
    writer.writeheader()
    for device in unique_devices:
        writer.writerow({
            'device_name': device['device_name'],
            'ip_address': device['ip_address']
        })

print(f"\nAll devices saved to: {output_file}")


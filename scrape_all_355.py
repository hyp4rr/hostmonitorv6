import re
import csv

# Read the HTML file
with open(r'c:\Users\hyper\Downloads\switch13-11.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

# Find all input buttons
button_pattern = r'<input\s+type=button[^>]*>'
button_matches = re.findall(button_pattern, html_content, re.IGNORECASE)

devices = []
ip_pattern = r'(\d+\.\d+\.\d+\.\d+)'

print(f"Found {len(button_matches)} input buttons")

for button_html in button_matches:
    # Extract value
    value_match = re.search(r"value=['\"]([^'\"]*)['\"]", button_html, re.IGNORECASE)
    value = value_match.group(1) if value_match else ''
    
    # Extract title
    title_match = re.search(r"title=['\"]([^'\"]*)['\"]", button_html, re.IGNORECASE)
    title = title_match.group(1) if title_match else ''
    
    # Extract onclick - need to get the full content including escaped quotes
    # The onclick can have escaped quotes, so we need to be careful
    onclick_match = re.search(r'onclick="(.*?)"(?=\s|>)', button_html, re.IGNORECASE | re.DOTALL)
    if not onclick_match:
        onclick_match = re.search(r"onclick='(.*?)'(?=\s|>)", button_html, re.IGNORECASE | re.DOTALL)
    onclick = onclick_match.group(1) if onclick_match else ''
    
    device_name = None
    ip_address = None
    
    # First, try to get device name and IP from onclick showInfo
    if onclick and 'showInfo' in onclick:
        # Extract showInfo parameters - handle escaped quotes
        # Format: showInfo('name','info with Ping: IP')
        showinfo_match = re.search(r"showInfo\(['\"]([^'\"]*)['\"],\s*['\"]([^'\"]*)['\"]", onclick, re.IGNORECASE)
        
        if showinfo_match:
            device_name = showinfo_match.group(1)
            info_content = showinfo_match.group(2)
            
            # Look for IP in info content - try different patterns
            # "Ping: IP" or "Ping IP" or just IP after "Ping"
            ip_match = re.search(r'Ping[:\s]+' + ip_pattern, info_content, re.IGNORECASE)
            if ip_match:
                ip_address = ip_match.group(1)
    
    # If we didn't get device name from showInfo, use value or title
    if not device_name:
        device_name = value or title
    
    # If we still don't have IP, try value/title
    if not ip_address:
        # Try value
        if value:
            ping_match = re.search(r'Ping:\s*' + ip_pattern, value, re.IGNORECASE)
            if ping_match:
                ip_address = ping_match.group(1)
                device_name = value.split('Ping:')[0].strip()
            else:
                # IP at end of value
                ip_at_end = re.search(r'\s+' + ip_pattern + r'$', value)
                if ip_at_end:
                    ip_address = ip_at_end.group(1)
                    device_name = value.replace(ip_address, '').strip()
        
        # Try title
        if not ip_address and title:
            ping_match = re.search(r'Ping:\s*' + ip_pattern, title, re.IGNORECASE)
            if ping_match:
                ip_address = ping_match.group(1)
                if not device_name:
                    device_name = title.split('Ping:')[0].strip()
    
    # Clean up device name
    if device_name:
        device_name = device_name.replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>')
        device_name = re.sub(r'\s+Ping:?\s*$', '', device_name, flags=re.IGNORECASE)
        device_name = re.sub(r'\s+' + ip_pattern + r'$', '', device_name)
        device_name = device_name.strip()
    
    # Only add if we have both name and IP
    if device_name and ip_address:
        devices.append({
            'device_name': device_name,
            'ip_address': ip_address
        })
    else:
        # Debug output for missing ones
        if 'showInfo' in onclick or value or title:
            print(f"Missing: name={device_name}, ip={ip_address}, value={value[:30]}")

# Remove duplicates based on IP
seen_ips = set()
unique_devices = []
for device in devices:
    if device['ip_address'] not in seen_ips:
        seen_ips.add(device['ip_address'])
        unique_devices.append(device)

# Sort by IP
unique_devices.sort(key=lambda x: tuple(map(int, x['ip_address'].split('.'))))

# Write to CSV
output_file = 'switches_all_355.csv'
with open(output_file, 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['device_name', 'ip_address'])
    writer.writeheader()
    writer.writerows(unique_devices)

print(f"\nExtracted {len(unique_devices)} unique devices with IPs")
print(f"Results saved to {output_file}")


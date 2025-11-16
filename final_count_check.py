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

print(f"Processing {len(button_matches)} buttons...\n")

for button_html in button_matches:
    # Extract value
    value_match = re.search(r"value=['\"]([^'\"]*)['\"]", button_html, re.IGNORECASE)
    value = value_match.group(1) if value_match else ''
    
    # Extract title
    title_match = re.search(r"title=['\"]([^'\"]*)['\"]", button_html, re.IGNORECASE)
    title = title_match.group(1) if title_match else ''
    
    # Extract onclick - try both double and single quotes
    onclick = ''
    onclick_match = re.search(r'onclick="([^"]*)"', button_html, re.IGNORECASE | re.DOTALL)
    if onclick_match:
        onclick = onclick_match.group(1)
    else:
        onclick_match = re.search(r"onclick='([^']*)'", button_html, re.IGNORECASE | re.DOTALL)
        if onclick_match:
            onclick = onclick_match.group(1)
    
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

# Remove duplicates based on IP (keep first occurrence)
seen_ips = set()
unique_devices = []
for device in devices:
    if device['ip_address'] not in seen_ips:
        seen_ips.add(device['ip_address'])
        unique_devices.append(device)

# Sort by IP
unique_devices.sort(key=lambda x: tuple(map(int, x['ip_address'].split('.'))))

# Write to CSV
output_file = 'switches_all_355_final.csv'
with open(output_file, 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['device_name', 'ip_address'])
    writer.writeheader()
    writer.writerows(unique_devices)

print("=" * 80)
print("FINAL COUNT")
print("=" * 80)
print(f"Total buttons in HTML: {len(button_matches)}")
print(f"Devices extracted with IPs: {len(unique_devices)}")
print(f"Unique IP addresses: {len(seen_ips)}")
print(f"\nResults saved to: {output_file}")

# Check for duplicates
from collections import defaultdict
ip_count = defaultdict(list)
for device in devices:
    ip_count[device['ip_address']].append(device['device_name'])

duplicates = {ip: names for ip, names in ip_count.items() if len(names) > 1}
if duplicates:
    print(f"\nDuplicate IPs (same IP, different names): {len(duplicates)}")
    for ip, names in sorted(duplicates.items(), key=lambda x: tuple(map(int, x[0].split('.')))):
        print(f"  {ip}: {len(names)} devices")
        for name in names:
            print(f"    - {name}")

# Show breakdown by IP range
ip_ranges = defaultdict(int)
for device in unique_devices:
    ip = device['ip_address']
    first_two = '.'.join(ip.split('.')[:2])
    ip_ranges[first_two] += 1

print("\n" + "=" * 80)
print("BREAKDOWN BY IP RANGE")
print("=" * 80)
for range_key in sorted(ip_ranges.keys()):
    print(f"  {range_key}.x.x: {ip_ranges[range_key]} devices")


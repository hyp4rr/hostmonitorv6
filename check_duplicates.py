import re
import csv
from collections import defaultdict

# Read the HTML file
with open(r'c:\Users\hyper\Downloads\switch13-11.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

# Find all input buttons
button_pattern = r'<input\s+type=button[^>]*>'
button_matches = re.findall(button_pattern, html_content, re.IGNORECASE)

devices = []
ip_pattern = r'(\d+\.\d+\.\d+\.\d+)'

for button_html in button_matches:
    value_match = re.search(r"value=['\"]([^'\"]*)['\"]", button_html, re.IGNORECASE)
    value = value_match.group(1) if value_match else ''
    
    title_match = re.search(r"title=['\"]([^'\"]*)['\"]", button_html, re.IGNORECASE)
    title = title_match.group(1) if title_match else ''
    
    onclick_match = re.search(r'onclick="([^"]*)"', button_html, re.IGNORECASE | re.DOTALL)
    onclick = onclick_match.group(1) if onclick_match else ''
    
    device_name = None
    ip_address = None
    
    if onclick and 'showInfo' in onclick:
        showinfo_match = re.search(r"showInfo\('([^']*)',\s*'([^']*)'\)", onclick, re.IGNORECASE | re.DOTALL)
        if showinfo_match:
            device_name = showinfo_match.group(1)
            info_content = showinfo_match.group(2)
            ip_match = re.search(r'Ping[:\s]+' + ip_pattern, info_content, re.IGNORECASE)
            if ip_match:
                ip_address = ip_match.group(1)
    
    if not device_name:
        device_name = value or title
    
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
        
        if not ip_address and title:
            ping_match = re.search(r'Ping:\s*' + ip_pattern, title, re.IGNORECASE)
            if ping_match:
                ip_address = ping_match.group(1)
                if not device_name:
                    device_name = title.split('Ping:')[0].strip()
    
    if device_name:
        device_name = device_name.replace('&amp;', '&')
        device_name = re.sub(r'\s+Ping:?\s*$', '', device_name, flags=re.IGNORECASE)
        device_name = re.sub(r'\s+' + ip_pattern + r'$', '', device_name)
        device_name = device_name.strip()
    
    if device_name and ip_address:
        devices.append({
            'device_name': device_name,
            'ip_address': ip_address
        })

# Count by IP
ip_count = defaultdict(list)
for device in devices:
    ip_count[device['ip_address']].append(device['device_name'])

# Find duplicates
duplicates = {ip: names for ip, names in ip_count.items() if len(names) > 1}

print(f"Total devices found: {len(devices)}")
print(f"Unique IPs: {len(ip_count)}")
print(f"IPs with multiple devices: {len(duplicates)}")
print(f"\nDuplicate IPs (same IP, different device names):")
for ip, names in sorted(duplicates.items(), key=lambda x: tuple(map(int, x[0].split('.')))):
    print(f"\n  {ip}:")
    for name in names:
        print(f"    - {name}")


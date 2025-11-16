import re
import csv

# Read the server HTML file
with open(r'c:\Users\hyper\Downloads\server13-11.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

# Find all input buttons
button_pattern = re.compile(r'<input\s+type=button[^>]+>', re.IGNORECASE | re.DOTALL)
buttons = button_pattern.findall(html_content)

print(f"Total buttons in HTML: {len(buttons)}")

# Read what we extracted
with open('database/seeders/data/server.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    extracted = {(row['ip_address'], row['name']) for row in reader}

print(f"Devices extracted: {len(extracted)}")
print(f"Missing: {len(buttons) - len(extracted)}")

# Analyze all buttons
ip_pattern = re.compile(r'\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b')
all_devices = {}
devices_by_ip = {}
duplicate_ips = set()

for button in buttons:
    # Extract attributes
    value_match = re.search(r"value=(['\"])([^'\"]*?)\1", button)
    value_attr = value_match.group(2) if value_match else ""
    
    title_match = re.search(r"title=(['\"])([^'\"]*?)\1", button)
    title_attr = title_match.group(2) if title_match else ""
    
    onclick_match = re.search(r"onclick\s*=\s*['\"]javascript:showInfo\((.*?)\)['\"]", button, re.DOTALL | re.IGNORECASE)
    onclick_content = onclick_match.group(1) if onclick_match else ""
    
    # Find IP
    ip_address = None
    device_name = None
    
    # Try title first
    ip_match = ip_pattern.search(title_attr)
    if ip_match:
        ip_address = ip_match.group(0)
        device_name = title_attr.replace(f" Ping: {ip_address}", "").replace(f" : Ping {ip_address}", "").replace(f" Ping {ip_address}", "").strip()
    
    # Try value
    if not ip_address:
        ip_match = ip_pattern.search(value_attr)
        if ip_match:
            ip_address = ip_match.group(0)
            device_name = value_attr.replace(f" Ping: {ip_address}", "").replace(f" : Ping {ip_address}", "").replace(f" Ping {ip_address}", "").strip()
    
    # Try onclick
    if not ip_address and onclick_content:
        ip_match = ip_pattern.search(onclick_content)
        if ip_match:
            ip_address = ip_match.group(0)
            # Get name from first argument
            name_match = re.match(r"(['\"])(.*?)\1", onclick_content)
            if name_match:
                device_name = name_match.group(2).replace("&amp;", "&").strip()
            else:
                device_name = value_attr or title_attr
    
    # Clean up name
    if device_name:
        device_name = re.sub(r' Ping: \d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', '', device_name).strip()
        device_name = re.sub(r' : Ping \d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', '', device_name).strip()
        device_name = re.sub(r' Ping \d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', '', device_name).strip()
        device_name = device_name.replace("&amp;", "&")
    
    if ip_address:
        if ip_address in devices_by_ip:
            duplicate_ips.add(ip_address)
        else:
            devices_by_ip[ip_address] = []
        devices_by_ip[ip_address].append({
            'name': device_name or value_attr or title_attr,
            'value': value_attr[:50],
            'title': title_attr[:50]
        })
        all_devices[ip_address] = device_name or value_attr or title_attr
    else:
        # No IP found - this device uses domain name only
        all_devices[f"NO_IP_{len([d for d in all_devices if d.startswith('NO_IP')])}"] = value_attr or title_attr

print(f"\nDevices with IPs: {len(devices_by_ip)}")
print(f"Duplicate IPs: {len(duplicate_ips)}")
print(f"Devices without IPs: {len(all_devices) - len(devices_by_ip)}")

if duplicate_ips:
    print(f"\nDuplicate IPs (will be deduplicated):")
    for ip in list(duplicate_ips)[:10]:
        print(f"  {ip}: {len(devices_by_ip[ip])} entries")
        for i, dev in enumerate(devices_by_ip[ip], 1):
            print(f"    {i}. {dev['name'][:50]}")

print(f"\nExpected unique devices: {len(devices_by_ip)} (one per unique IP)")
print(f"Extracted devices: {len(extracted)}")
print(f"Difference: {len(devices_by_ip) - len(extracted)}")

if len(devices_by_ip) != len(extracted):
    print("\nChecking which IPs are missing...")
    extracted_ips = {ip for ip, name in extracted}
    missing_ips = set(devices_by_ip.keys()) - extracted_ips
    if missing_ips:
        print(f"Missing IPs: {len(missing_ips)}")
        for ip in list(missing_ips)[:10]:
            print(f"  {ip}: {devices_by_ip[ip][0]['name']}")




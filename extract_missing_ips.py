import re

# Read the HTML file
with open(r'c:\Users\hyper\Downloads\switch13-11.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

# List of device names that were flagged as having no IP
device_names_to_check = [
    'B4-Surau',
    'C10-Makmal FKEE',
    'C13-Makmal Bahasa Disti',
    'C15-1stFloor',
    'C16-1stfloor',
    'C17-1stfloor',
    'C2-CCTV Rack Server',
    'C2-Makmal Bahasa',
    'C2-Makmal CAD FKEE',
    'C7-Kabin',
    'C8-Bilik Pensyarah',
    'C9-Bilik Pensyarah',
    'G1-A-Server UCiTV',
    'G2-G Makmal CADCAM2'
]

ip_pattern = r'(\d+\.\d+\.\d+\.\d+)'

print("=" * 80)
print("DEVICES THAT APPEARED TO HAVE NO IP (Checking onclick)")
print("=" * 80)
print()

found_devices = []
not_found = []

for device_name in device_names_to_check:
    # Search for the button with this device name
    # Escape special regex characters
    escaped_name = re.escape(device_name)
    pattern = rf'<input[^>]*value=[\'"]{escaped_name}[\'"][^>]*>'
    
    match = re.search(pattern, html_content, re.IGNORECASE)
    
    if match:
        button_html = match.group(0)
        
        # Extract onclick
        onclick_match = re.search(r'onclick="([^"]*)"', button_html, re.IGNORECASE | re.DOTALL)
        onclick = onclick_match.group(1) if onclick_match else ''
        
        # Look for IP in onclick
        ip_match = re.search(r'Ping[:\s]+' + ip_pattern, onclick, re.IGNORECASE)
        
        if ip_match:
            ip_address = ip_match.group(1)
            found_devices.append({
                'name': device_name,
                'ip': ip_address,
                'onclick_snippet': onclick[:200]
            })
        else:
            # Try to find any IP in onclick
            any_ip = re.search(ip_pattern, onclick)
            if any_ip:
                found_devices.append({
                    'name': device_name,
                    'ip': any_ip.group(1),
                    'onclick_snippet': onclick[:200]
                })
            else:
                not_found.append({
                    'name': device_name,
                    'onclick': onclick[:200] if onclick else 'No onclick'
                })
    else:
        not_found.append({
            'name': device_name,
            'onclick': 'Button not found in HTML'
        })

print("DEVICES WITH IPs FOUND IN ONCLICK:")
print("-" * 80)
for device in found_devices:
    print(f"{device['name']:<40} IP: {device['ip']}")
    print(f"  Onclick snippet: {device['onclick_snippet'][:100]}...")
    print()

print()
print("DEVICES STILL WITHOUT IP:")
print("-" * 80)
if not_found:
    for device in not_found:
        print(f"{device['name']:<40}")
        print(f"  Onclick: {device['onclick'][:100]}...")
        print()
else:
    print("  None - all devices have IPs!")

# Write to file
with open('missing_ips_found.txt', 'w', encoding='utf-8') as f:
    f.write("DEVICES THAT APPEARED TO HAVE NO IP\n")
    f.write("=" * 80 + "\n\n")
    
    f.write("DEVICES WITH IPs FOUND:\n")
    f.write("-" * 80 + "\n")
    for device in found_devices:
        f.write(f"{device['name']} - {device['ip']}\n")
    
    f.write("\n\nDEVICES STILL WITHOUT IP:\n")
    f.write("-" * 80 + "\n")
    for device in not_found:
        f.write(f"{device['name']}\n")
        f.write(f"  Onclick: {device['onclick']}\n\n")

print(f"\nResults saved to: missing_ips_found.txt")


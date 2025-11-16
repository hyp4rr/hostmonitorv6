import re

# Read the HTML file
with open(r'c:\Users\hyper\Downloads\switch13-11.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

# List of device names
device_names = [
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
print("14 BUTTONS WITHOUT IP - DETAILED CHECK")
print("=" * 80)
print()

results = []

for device_name in device_names:
    # Search for the button - handle both single and double quotes in value
    # Pattern: value='DeviceName' or value="DeviceName"
    pattern1 = rf"value=['\"]{re.escape(device_name)}['\"]"
    pattern2 = rf"value=['\"]{re.escape(device_name)}['\"]"
    
    # Find the button line
    lines = html_content.split('\n')
    button_line = None
    for line in lines:
        if device_name in line and 'input type=button' in line:
            button_line = line
            break
    
    if button_line:
        # Extract onclick from the line
        onclick_match = re.search(r'onclick="([^"]*)"', button_line, re.IGNORECASE | re.DOTALL)
        onclick = onclick_match.group(1) if onclick_match else ''
        
        # Look for IP
        ip_match = re.search(r'Ping[:\s]+' + ip_pattern, onclick, re.IGNORECASE)
        
        if ip_match:
            ip_address = ip_match.group(1)
            results.append({
                'name': device_name,
                'ip': ip_address,
                'status': 'FOUND'
            })
        else:
            # Check if there's any IP at all
            any_ip = re.search(ip_pattern, onclick)
            if any_ip:
                results.append({
                    'name': device_name,
                    'ip': any_ip.group(1),
                    'status': 'FOUND (different format)'
                })
            else:
                results.append({
                    'name': device_name,
                    'ip': 'NOT FOUND',
                    'status': 'NO IP',
                    'onclick_preview': onclick[:150] if onclick else 'No onclick'
                })
    else:
        results.append({
            'name': device_name,
            'ip': 'NOT FOUND',
            'status': 'BUTTON NOT FOUND'
        })

print("RESULTS:")
print("-" * 80)
for result in results:
    print(f"{result['name']:<40} IP: {result['ip']:<15} Status: {result['status']}")
    if 'onclick_preview' in result:
        print(f"  Onclick: {result['onclick_preview']}")
    print()

# Summary
found = [r for r in results if r['ip'] != 'NOT FOUND']
not_found = [r for r in results if r['ip'] == 'NOT FOUND']

print()
print("=" * 80)
print("SUMMARY")
print("=" * 80)
print(f"Devices with IPs found: {len(found)}")
print(f"Devices without IPs: {len(not_found)}")
print()

if found:
    print("Devices with IPs:")
    for r in found:
        print(f"  {r['name']:<40} {r['ip']}")

if not_found:
    print("\nDevices without IPs:")
    for r in not_found:
        print(f"  {r['name']}")

# Write to file
with open('14_buttons_analysis.txt', 'w', encoding='utf-8') as f:
    f.write("14 BUTTONS WITHOUT IP - ANALYSIS\n")
    f.write("=" * 80 + "\n\n")
    
    for result in results:
        f.write(f"{result['name']}\n")
        f.write(f"  IP: {result['ip']}\n")
        f.write(f"  Status: {result['status']}\n")
        if 'onclick_preview' in result:
            f.write(f"  Onclick: {result['onclick_preview']}\n")
        f.write("\n")

print(f"\nDetailed analysis saved to: 14_buttons_analysis.txt")


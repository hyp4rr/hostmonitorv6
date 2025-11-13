import re
import csv
import html

# Read the HTML file
with open('Switch.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

# Find all input button elements - simpler pattern
pattern = r'<input type=button class=(\w+) value=\'([^\']+)\''
matches = re.findall(pattern, html_content)

switches = []
seen_ips = set()

for match in matches:
    status_class = match[0]  # Alive, NoAnswer, etc.
    value = html.unescape(match[1])  # Decode HTML entities like &amp;
    
    # Extract IP address from value
    ip_match = re.search(r'(\d+\.\d+\.\d+\.\d+)', value)
    
    if ip_match:
        ip_address = ip_match.group(1)
        
        # Skip duplicates
        if ip_address in seen_ips:
            continue
        seen_ips.add(ip_address)
        
        # Extract name (clean up the value)
        name = value.strip()
        # Remove "Ping:" and IP address patterns
        name = re.sub(r'\s*Ping[:\s]+\d+\.\d+\.\d+\.\d+\s*$', '', name)
        name = re.sub(r'\s+\d+\.\d+\.\d+\.\d+\s*$', '', name)
        name = name.strip()
        
        # If name is empty or just whitespace, use IP as name
        if not name:
            name = f"Switch {ip_address}"
        
        # Default location
        location = "MC"
        
        # Default response time
        response_time = '1'
        
        # Determine status
        status = 'online' if status_class == 'Alive' else 'offline'
        
        switches.append({
            'location': location,
            'name': name,
            'ip_address': ip_address,
            'status': status,
            'response_time': response_time
        })

# Sort by IP address
switches.sort(key=lambda x: [int(part) for part in x['ip_address'].split('.')])

# Write to CSV
with open('switches_new.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['location', 'name', 'ip_address', 'status', 'response_time'])
    writer.writeheader()
    writer.writerows(switches)

print(f"✅ Extracted {len(switches)} unique switches")
print(f"📝 Saved to switches_new.csv")
print(f"\nFirst 5 entries:")
for i, switch in enumerate(switches[:5]):
    print(f"  {i+1}. {switch['name']} - {switch['ip_address']}")

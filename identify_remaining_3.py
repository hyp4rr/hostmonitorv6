import re

# Read the HTML file
with open(r'c:\Users\hyper\Downloads\switch13-11.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

# Find the stats buttons at the top
# They're in the header section
header_section = html_content.split('<hr>')[0]

# Find all input buttons in the header
button_pattern = r'<input[^>]*type=["\']?button["\']?[^>]*>'
header_buttons = re.findall(button_pattern, header_section, re.IGNORECASE)

print("=" * 80)
print("THE REMAINING 3 BUTTONS")
print("=" * 80)
print()
print("These are UI STATISTICS BUTTONS at the top of the page, not devices:")
print()

for i, button_html in enumerate(header_buttons, 1):
    # Extract id
    id_match = re.search(r'id=["\']([^"\']*)["\']', button_html, re.IGNORECASE)
    button_id = id_match.group(1) if id_match else 'No ID'
    
    # Extract title
    title_match = re.search(r'title=["\']([^"\']*)["\']', button_html, re.IGNORECASE)
    title = title_match.group(1) if title_match else 'No title'
    
    # Extract value
    value_match = re.search(r'value=["\']([^"\']*)["\']', button_html, re.IGNORECASE)
    value = value_match.group(1) if value_match else 'No value'
    
    # Extract class
    class_match = re.search(r'class=["\']([^"\']*)["\']', button_html, re.IGNORECASE)
    button_class = class_match.group(1) if class_match else 'No class'
    
    # Check for IP
    ip_pattern = r'(\d+\.\d+\.\d+\.\d+)'
    has_ip = bool(re.search(ip_pattern, button_html))
    
    print(f"Button {i}:")
    print(f"  ID: {button_id}")
    print(f"  Title: {title}")
    print(f"  Value: '{value}'")
    print(f"  Class: {button_class}")
    print(f"  Has IP: {has_ip}")
    print(f"  HTML: {button_html[:150]}...")
    print()

print("=" * 80)
print("SUMMARY")
print("=" * 80)
print("These 3 buttons are UI elements for displaying statistics:")
print("  1. Good tests (btn1g)")
print("  2. Bad tests - not acknowledged (btn2b)")
print("  3. Warning+Unknown - not acknowledged (btn3u)")
print()
print("They are NOT devices - they're just buttons to show/hide statistics.")
print("They have no IP addresses because they're not network devices.")


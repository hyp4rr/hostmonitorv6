import csv
import re
import os

def extract_button_content(html_content):
    """Extract all button elements, handling nested quotes and HTML content"""
    buttons = []
    
    # Find all input buttons by parsing character by character
    # This handles quoted attributes correctly
    pattern = r'<input\s+type=button\s+'
    
    # Use finditer to get positions
    for match in re.finditer(pattern, html_content, re.IGNORECASE):
        button_start = match.start()
        # Parse the button by tracking quotes
        pos = match.end()
        in_quote = False
        quote_char = None
        button_end = None
        
        while pos < len(html_content):
            char = html_content[pos]
            
            if char in ('"', "'") and (pos == 0 or html_content[pos-1] != '\\'):
                if not in_quote:
                    in_quote = True
                    quote_char = char
                elif char == quote_char:
                    in_quote = False
                    quote_char = None
            elif char == '>' and not in_quote:
                button_end = pos + 1
                break
            
            pos += 1
        
        if button_end:
            button_text = html_content[button_start:button_end]
            buttons.append(button_text)
    
    return buttons

def extract_devices_from_html(html_content, category):
    devices = {}
    # Regex to extract IP addresses
    ip_pattern = re.compile(r'\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b')
    
    # Extract buttons using improved method
    buttons = extract_button_content(html_content)
    
    for button_html in buttons:
        
        # Extract value attribute (can be single or double quoted)
        value_match = re.search(r"value=(['\"])([^'\"]*?)\1", button_html)
        value_attr = value_match.group(2) if value_match else ""
        
        # Extract title attribute (can be single or double quoted)
        title_match = re.search(r"title=(['\"])([^'\"]*?)\1", button_html)
        title_attr = title_match.group(2) if title_match else ""
        
        # Extract onclick - use a more flexible approach
        onclick_content = ""
        
        # First, try to find onclick= and extract everything until the closing quote
        # Handle both double and single quotes for the onclick attribute
        onclick_match = re.search(r'onclick\s*=\s*"([^"]*)"', button_html, re.DOTALL | re.IGNORECASE)
        if not onclick_match:
            onclick_match = re.search(r"onclick\s*=\s*'([^']*)'", button_html, re.DOTALL | re.IGNORECASE)
        
        if onclick_match:
            onclick_full = onclick_match.group(1)
            # Extract the content inside showInfo()
            showinfo_match = re.search(r'javascript:showInfo\((.*)\)', onclick_full, re.DOTALL | re.IGNORECASE)
            if showinfo_match:
                onclick_content = showinfo_match.group(1)

        device_name = None
        ip_address = None

        # Try to get IP from title first
        ip_match_title = ip_pattern.search(title_attr)
        if ip_match_title:
            ip_address = ip_match_title.group(0)
            # Handle various formats: "Ping: IP", " : Ping IP", "Ping IP"
            device_name = title_attr.replace(f" Ping: {ip_address}", "").strip()
            device_name = device_name.replace(f" : Ping {ip_address}", "").strip()
            device_name = device_name.replace(f" Ping {ip_address}", "").strip()
            device_name = device_name.replace(f" {ip_address}", "").strip()
            device_name = device_name.replace("&amp;", "&")
        
        # If IP not found in title or name is too generic, try value
        if not ip_address:
            ip_match_value = ip_pattern.search(value_attr)
            if ip_match_value:
                ip_address = ip_match_value.group(0)
                # Handle various formats: "Ping: IP", " : Ping IP", "Ping IP"
                device_name = value_attr.replace(f" Ping: {ip_address}", "").strip()
                device_name = device_name.replace(f" : Ping {ip_address}", "").strip()
                device_name = device_name.replace(f" Ping {ip_address}", "").strip()
                device_name = device_name.replace(f" {ip_address}", "").strip()
                device_name = device_name.replace("&amp;", "&")

        # If IP still not found, try the onclick content
        if not ip_address and onclick_content:
            # Try to parse onclick arguments - can be single or double quoted
            onclick_args_pattern = re.compile(r"(['\"])(.*?)\1\s*,\s*(['\"])(.*?)\3", re.DOTALL)
            onclick_args_match = onclick_args_pattern.match(onclick_content)
            if onclick_args_match:
                detailed_info_string = onclick_args_match.group(4)
                # Search for IP in the entire onclick content (not just the second argument)
                ip_match_onclick = ip_pattern.search(onclick_content)
                if ip_match_onclick:
                    ip_address = ip_match_onclick.group(0)
                    # Use the first argument of showInfo as the primary device name
                    device_name = onclick_args_match.group(2).replace("&amp;", "&").strip()
                    device_name = device_name.replace(f" Ping: {ip_address}", "").strip()
                    device_name = device_name.replace(f" : Ping {ip_address}", "").strip()
                    device_name = device_name.replace(f" Ping {ip_address}", "").strip()
                    device_name = device_name.replace(f" {ip_address}", "").strip()
            else:
                # If the pattern doesn't match, try to find IP anywhere in onclick
                ip_match_onclick = ip_pattern.search(onclick_content)
                if ip_match_onclick:
                    ip_address = ip_match_onclick.group(0)
                    # Try to get name from the start of onclick content
                    name_match = re.match(r"(['\"])(.*?)\1", onclick_content)
                    if name_match:
                        device_name = name_match.group(2).replace("&amp;", "&").strip()
                    else:
                        # Use value or title as fallback
                        device_name = value_attr or title_attr
                        device_name = device_name.replace("&amp;", "&").strip()
                    
        # Fallback if IP is still not found but name is available
        if not ip_address:
            ip_match_fallback = ip_pattern.search(value_attr)
            if ip_match_fallback:
                ip_address = ip_match_fallback.group(0)
                device_name = value_attr.replace(f" Ping: {ip_address}", "").strip()
                device_name = device_name.replace(f" : Ping {ip_address}", "").strip()
                device_name = device_name.replace(f" Ping {ip_address}", "").strip()
                device_name = device_name.replace(f" {ip_address}", "").strip()
                device_name = device_name.replace("&amp;", "&")
            else:
                ip_match_fallback = ip_pattern.search(title_attr)
                if ip_match_fallback:
                    ip_address = ip_match_fallback.group(0)
                    device_name = title_attr.replace(f" Ping: {ip_address}", "").strip()
                    device_name = device_name.replace(f" : Ping {ip_address}", "").strip()
                    device_name = device_name.replace(f" Ping {ip_address}", "").strip()
                    device_name = device_name.replace(f" {ip_address}", "").strip()
                    device_name = device_name.replace("&amp;", "&")

        if device_name and ip_address:
            # Clean up device name further
            device_name = re.sub(r' Ping: \d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', '', device_name).strip()
            device_name = re.sub(r' : Ping \d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', '', device_name).strip()
            device_name = re.sub(r' Ping \d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', '', device_name).strip()
            device_name = re.sub(r' \d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', '', device_name).strip()
            device_name = device_name.replace("&amp;", "&")
            
            # Handle truncation (ending with ...)
            if device_name.endswith("..."):
                # Try to get full name from title if available
                if title_attr and len(title_attr) > len(value_attr):
                    full_name_match = re.match(r"^(.*?)(?:\s*[:]?\s*Ping[:\s]+\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})?$", title_attr)
                    if full_name_match:
                        device_name = full_name_match.group(1).replace("&amp;", "&").strip()
                else:
                    # Try onclick first argument
                    if onclick_content:
                        onclick_args_pattern = re.compile(r"(['\"])(.*?)\1")
                        onclick_args_match = onclick_args_pattern.match(onclick_content)
                        if onclick_args_match:
                            device_name = onclick_args_match.group(2).replace("&amp;", "&").strip()
                            device_name = re.sub(r' Ping: \d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', '', device_name).strip()
                            device_name = re.sub(r' : Ping \d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', '', device_name).strip()
                            device_name = re.sub(r' Ping \d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', '', device_name).strip()

            devices[ip_address] = device_name # Use IP as key to handle duplicates

    return devices

def import_devices_to_csv(extracted_devices, output_csv_path, category):
    header = ['name', 'ip_address', 'category', 'status', 'location', 'brand']
    rows = []

    for ip, name in extracted_devices.items():
        rows.append({
            'name': name,
            'ip_address': ip,
            'category': category,
            'status': 'unknown',
            'location': '',
            'brand': ''
        })

    # Sort by IP address for consistency
    rows.sort(key=lambda x: tuple(map(int, x['ip_address'].split('.'))))

    with open(output_csv_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=header)
        writer.writeheader()
        writer.writerows(rows)

    return len(rows)

if __name__ == "__main__":
    # File mappings: (html_file, category, output_csv)
    files_to_process = [
        (r'c:\Users\hyper\Downloads\server13-11.html', 'servers', r'database\seeders\data\server.csv'),
        (r'c:\Users\hyper\Downloads\cctv13-11.html', 'cctv', r'database\seeders\data\cctv.csv'),
        (r'c:\Users\hyper\Downloads\wifi13-11.html', 'wifi', r'database\seeders\data\wifi.csv'),
    ]

    total_devices = 0
    summary = []

    for html_file, category, output_csv in files_to_process:
        print(f"\n{'='*80}")
        print(f"Processing: {os.path.basename(html_file)}")
        print(f"Category: {category}")
        print(f"{'='*80}")
        
        if not os.path.exists(html_file):
            print(f"ERROR: File not found: {html_file}")
            continue

        # Try different encodings
        encodings = ['utf-8', 'latin-1', 'cp1252', 'iso-8859-1']
        html_content = None
        for encoding in encodings:
            try:
                with open(html_file, 'r', encoding=encoding) as f:
                    html_content = f.read()
                print(f"Successfully read file with {encoding} encoding")
                break
            except UnicodeDecodeError:
                continue
        
        if html_content is None:
            print(f"ERROR: Could not read file with any encoding")
            continue

        extracted_devices = extract_devices_from_html(html_content, category)
        count = import_devices_to_csv(extracted_devices, output_csv, category)
        
        total_devices += count
        summary.append({
            'category': category,
            'count': count,
            'file': output_csv
        })
        
        print(f"Extracted {count} devices")
        print(f"Saved to: {output_csv}")
        if count > 0:
            print(f"\nFirst 5 devices:")
            for i, (ip, name) in enumerate(list(extracted_devices.items())[:5], 1):
                try:
                    print(f"  {i}. {name:<50} {ip}")
                except UnicodeEncodeError:
                    # Fallback for encoding issues
                    safe_name = name.encode('ascii', 'replace').decode('ascii')
                    print(f"  {i}. {safe_name:<50} {ip}")

    print(f"\n{'='*80}")
    print(f"EXTRACTION SUMMARY")
    print(f"{'='*80}")
    print(f"Total devices extracted: {total_devices}")
    print(f"\nBreakdown by category:")
    for item in summary:
        print(f"  • {item['category']:10} : {item['count']:4} devices -> {item['file']}")
    print(f"\n{'='*80}")
    print(f"All devices have been extracted and saved to CSV files!")
    print(f"{'='*80}")


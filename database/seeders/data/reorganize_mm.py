import csv
import re

def extract_location(device_name):
    """Extract location from device name."""
    # Try to extract building/location code from the beginning
    # Examples: KBANDAR, KKTSN, D2, A18, Masjid, FPTV, FKAAB, etc.
    
    # Common patterns
    patterns = [
        r'^([A-Z]+\d+)',  # A18, D2, E16, etc.
        r'^(KBANDAR|KKTSN|KB|KK)',  # Kolej Kediaman
        r'^(Masjid)',
        r'^(FKAAB|FPTV|FKAAS|FKEE|FKMP|FSKTM|FPTP|FPTV|FK)',  # Faculties
        r'^(Library|LIB)',
        r'^(Perwira)',
        r'^(HEP)',
        r'^(RECESS)',
        r'^(Biodesel)',
        r'^(TDI|TF)',
        r'^(ATM)',
        r'^(PMU|PKU)',
        r'^([A-Z]\d+)',  # Single letter + number (A5, B1, C2, etc.)
        r'^([A-Z]{1,2})-',  # Single/double letter followed by dash
    ]
    
    for pattern in patterns:
        match = re.match(pattern, device_name)
        if match:
            return match.group(1)
    
    # If no pattern matches, try to get first segment before dash or underscore
    parts = re.split(r'[-_]', device_name)
    if parts and parts[0]:
        # Check if first part looks like a location code
        first_part = parts[0]
        if len(first_part) > 0 and len(first_part) <= 10 and (first_part[0].isupper() or first_part.isalnum()):
            return first_part
    
    # Default fallback
    return 'General'

def determine_status(uptime_str):
    """Determine status based on uptime string."""
    uptime_str = uptime_str.strip().lower()
    
    # If uptime is very short or shows recent activity, it's online
    if uptime_str in ['0s', ''] or 'ms' in uptime_str:
        return 'online'
    
    # Parse uptime to determine if device is likely offline
    # If uptime is very long (>7 days), might be offline
    if 'd' in uptime_str:
        try:
            days = int(re.search(r'(\d+)d', uptime_str).group(1))
            if days > 7:
                return 'offline'
        except:
            pass
    
    # Default to online for devices with reasonable uptime
    return 'online'

def reorganize_mm_csv(input_file, output_file):
    """Reorganize MM.csv to match seeder format."""
    
    with open(input_file, 'r', encoding='utf-8') as infile:
        reader = csv.reader(infile)
        
        # Skip header
        header = next(reader)
        print(f"Original header: {header}")
        
        # Prepare output data
        output_data = []
        location_counts = {}
        
        for row in reader:
            if len(row) < 4:
                continue
            
            device_name = row[0].strip('"')
            col2 = row[1].strip('"')
            model = row[2].strip('"')
            col4 = row[3].strip('"')
            
            # Detect format by checking if col2 looks like an IP address
            # Format 1: name, uptime, model, ip_address
            # Format 2: name, ip_address, model, mac_address
            if ':' in col2 or '.' not in col2:
                # Format 1: col2 is uptime, col4 is IP
                uptime = col2
                ip_address = col4
            else:
                # Format 2: col2 is IP, col4 is MAC
                ip_address = col2
                uptime = '0s'  # Default uptime
            
            # Skip invalid IPs or MACs
            if not ip_address or ip_address == '0.0.0.0' or ':' in ip_address:
                continue
            
            # Extract location from device name
            location = extract_location(device_name)
            
            # Track location usage
            location_counts[location] = location_counts.get(location, 0) + 1
            
            # Determine status
            status = determine_status(uptime)
            
            # Default response time
            response_time = '1'
            
            # New format: location, name, ip_address, status, response_time
            output_data.append([location, device_name, ip_address, status, response_time])
        
        # Write output file
        with open(output_file, 'w', encoding='utf-8', newline='') as outfile:
            writer = csv.writer(outfile)
            
            # Write header
            writer.writerow(['location', 'name', 'ip_address', 'status', 'response_time'])
            
            # Write data
            writer.writerows(output_data)
        
        print(f"\n✅ Conversion complete!")
        print(f"📊 Total devices: {len(output_data)}")
        print(f"\n📍 Locations found ({len(location_counts)}):")
        for loc, count in sorted(location_counts.items(), key=lambda x: x[1], reverse=True):
            print(f"   {loc}: {count} devices")

if __name__ == '__main__':
    input_file = 'MM.csv'
    output_file = 'wifi.csv'  # This will be the WiFi access points
    
    print("🚀 Starting MM.csv reorganization...")
    print(f"📥 Input: {input_file}")
    print(f"📤 Output: {output_file}")
    print()
    
    reorganize_mm_csv(input_file, output_file)

import csv
import os

def remove_duplicates_from_csv(input_file, output_file=None):
    """Remove duplicate entries based on IP address from CSV file."""
    
    if output_file is None:
        output_file = input_file
    
    if not os.path.exists(input_file):
        print(f"⚠️  File not found: {input_file}")
        return
    
    print(f"\n📄 Processing: {input_file}")
    
    with open(input_file, 'r', encoding='utf-8') as infile:
        reader = csv.reader(infile)
        
        # Read header
        header = next(reader)
        print(f"   Header: {header}")
        
        # Find IP address column index
        ip_col_index = None
        for i, col in enumerate(header):
            if 'ip' in col.lower() or 'address' in col.lower():
                ip_col_index = i
                break
        
        if ip_col_index is None:
            print(f"   ⚠️  No IP address column found, skipping...")
            return
        
        # Track seen IPs and keep first occurrence
        seen_ips = set()
        unique_rows = []
        duplicate_count = 0
        
        for row in reader:
            if len(row) <= ip_col_index:
                continue
            
            ip_address = row[ip_col_index].strip().strip('"')
            
            # Skip empty IPs
            if not ip_address or ip_address == '0.0.0.0':
                continue
            
            # Check if IP already seen
            if ip_address in seen_ips:
                duplicate_count += 1
                continue
            
            seen_ips.add(ip_address)
            unique_rows.append(row)
        
        # Write cleaned data
        with open(output_file, 'w', encoding='utf-8', newline='') as outfile:
            writer = csv.writer(outfile)
            writer.writerow(header)
            writer.writerows(unique_rows)
        
        print(f"   ✅ Original: {len(seen_ips) + duplicate_count} rows")
        print(f"   ✅ Unique: {len(unique_rows)} rows")
        print(f"   ❌ Removed: {duplicate_count} duplicates")

def main():
    """Process all CSV files in the data directory."""
    
    print("🚀 Starting duplicate removal process...")
    print("=" * 60)
    
    csv_files = [
        'cctv.csv',
        'switches.csv',
        'wifi.csv',
        'server.csv',
        'tas.csv',
    ]
    
    total_removed = 0
    
    for csv_file in csv_files:
        if os.path.exists(csv_file):
            remove_duplicates_from_csv(csv_file)
        else:
            print(f"\n⚠️  File not found: {csv_file}")
    
    print("\n" + "=" * 60)
    print("✅ Duplicate removal complete!")

if __name__ == '__main__':
    main()

import csv
import os
from collections import defaultdict

def remove_cross_file_duplicates():
    """Remove duplicate IPs across all CSV files, keeping first occurrence."""
    
    print("🚀 Removing cross-file duplicate IPs...")
    print("=" * 60)
    
    # Priority order: keep the first file's entry
    csv_files = [
        'server.csv',      # Keep servers first (infrastructure)
        'switches.csv',    # Then switches
        'cctv.csv',        # Then CCTV
        'wifi.csv',        # Then WiFi
        'tas.csv',         # Then TAS
    ]
    
    # Track IPs we've seen
    seen_ips = set()
    
    for csv_file in csv_files:
        if not os.path.exists(csv_file):
            continue
        
        print(f"\n📄 Processing: {csv_file}")
        
        with open(csv_file, 'r', encoding='utf-8') as infile:
            reader = csv.reader(infile)
            header = next(reader)
            
            # Find IP column
            ip_col_index = None
            for i, col in enumerate(header):
                col_clean = col.strip('\ufeff').lower()
                if 'ip' in col_clean or 'address' in col_clean:
                    ip_col_index = i
                    break
            
            if ip_col_index is None:
                print(f"   ⚠️  No IP column found")
                continue
            
            # Read all rows
            rows = list(reader)
        
        # Filter out duplicate IPs
        unique_rows = []
        removed_count = 0
        
        for row in rows:
            if len(row) <= ip_col_index:
                continue
            
            ip_address = row[ip_col_index].strip().strip('"')
            
            if not ip_address or ip_address == '0.0.0.0':
                continue
            
            if ip_address in seen_ips:
                removed_count += 1
                print(f"   ❌ Removing duplicate IP: {ip_address} - {row[1] if len(row) > 1 else 'N/A'}")
                continue
            
            seen_ips.add(ip_address)
            unique_rows.append(row)
        
        # Write back to file
        with open(csv_file, 'w', encoding='utf-8', newline='') as outfile:
            writer = csv.writer(outfile)
            writer.writerow(header)
            writer.writerows(unique_rows)
        
        print(f"   ✅ Kept: {len(unique_rows)} rows")
        print(f"   ❌ Removed: {removed_count} duplicates")
    
    print("\n" + "=" * 60)
    print(f"✅ Cross-file duplicate removal complete!")
    print(f"📊 Total unique IPs: {len(seen_ips)}")

if __name__ == '__main__':
    remove_cross_file_duplicates()

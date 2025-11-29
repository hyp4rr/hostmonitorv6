# IP Range Tester for Windows - Logs to CSV (No DNS Flush Version)
# Tests entire /22 subnet (10.8.24.1 → 10.8.27.254)
# Excludes IPs from CSV file
# Also pings additional specific IPs: 10.8.2.201, 10.8.2.202, 10.8.27.254, 10.60.23.254
# Network Config: Subnet 255.255.252.0 (/22), Gateway 10.8.27.254, DNS: 10.8.2.201, 10.8.2.202

param(
    [string]$Adapter = "Ethernet",
    [string]$Gateway = "10.8.27.254",
    [string]$SubnetMask = "255.255.252.0",
    [int]$Prefix = 22,
    [string[]]$DNSServers = @("10.8.2.201", "10.8.2.202"),
    [string]$LogFile = "ip_test_results_$(Get-Date -Format 'yyyyMMdd_HHmmss').csv",
    [string]$ExcludeCsv = "c:\Users\hyper\Downloads\ips.csv",
    [int]$PingCount = 2,
    [int]$DelaySeconds = 3
)

# Set error action preference to continue on errors
$ErrorActionPreference = "Continue"

# Additional IPs to ping
$additionalIPs = @(
    "10.8.2.201",
    "10.8.2.202",
    "10.8.27.254",
    "10.60.23.254"
)

Write-Host "Script starting..." -ForegroundColor Cyan

# Requires admin privileges
Write-Host "Checking admin privileges..." -ForegroundColor Yellow
try {
    $isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
    if (-NOT $isAdmin) {
        Write-Warning "This script requires Administrator privileges. Please run as Administrator."
        Write-Host "Press any key to exit..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit 1
    }
    Write-Host "Admin privileges confirmed." -ForegroundColor Green
} catch {
    Write-Error "Error checking admin privileges: $($_.Exception.Message)"
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Validate network adapter exists
Write-Host "Checking network adapter: $Adapter..." -ForegroundColor Yellow
try {
    $adapterCheck = Get-NetAdapter -Name $Adapter -ErrorAction Stop
    Write-Host "Using adapter: $Adapter ($($adapterCheck.InterfaceDescription))" -ForegroundColor Green
} catch {
    Write-Error "Network adapter '$Adapter' not found. Available adapters:"
    Get-NetAdapter | Select-Object Name, InterfaceDescription | Format-Table
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Load excluded IPs from CSV - More robust parsing
$excludedIPs = @{}
Write-Host "Loading excluded IPs from: $ExcludeCsv..." -ForegroundColor Yellow

if (Test-Path $ExcludeCsv) {
    try {
        # Try to parse with tab delimiter first
        try {
            $csvData = Import-Csv -Path $ExcludeCsv -Delimiter "`t" -ErrorAction Stop
            Write-Host "Successfully parsed CSV as tab-delimited" -ForegroundColor Green
            
            # Process each row
            $excludedCount = 0
            foreach ($row in $csvData) {
                # Try to get IP from various possible column names
                $ipValue = $null
                
                # Method 1: Direct property access
                if ($row.PSObject.Properties.Name -contains 'IP') {
                    $ipValue = $row.IP
                }
                
                # Method 2: Case-insensitive property access
                if (-not $ipValue) {
                    $ipProp = $row.PSObject.Properties | Where-Object { $_.Name -eq 'IP' -or $_.Name -eq 'ip' -or $_.Name -eq 'Ip' }
                    if ($ipProp) {
                        $ipValue = $ipProp.Value
                    }
                }
                
                # Method 3: Try getting the 3rd column (index 2) directly
                if (-not $ipValue -and $row.PSObject.Properties.Count -ge 3) {
                    $props = @($row.PSObject.Properties.Name)
                    if ($props.Count -ge 3) {
                        $ipValue = $row.$($props[2])
                    }
                }
                
                # Clean up and validate IP
                if ($ipValue) {
                    $ipValue = $ipValue.Trim()
                    if ($ipValue -match '^\d+\.\d+\.\d+\.\d+$') {
                        $excludedIPs[$ipValue] = $true
                        $excludedCount++
                    }
                }
            }
            
            if ($excludedCount -gt 0) {
                Write-Host "Successfully loaded $excludedCount IPs to exclude from testing" -ForegroundColor Green
                # Show a few sample IPs that will be excluded
                $sampleIPs = $excludedIPs.Keys | Where-Object { $_ -match '^10\.8\.2[4-7]\.' } | Select-Object -First 3
                if ($sampleIPs) {
                    Write-Host "Sample IPs that will be excluded: $($sampleIPs -Join ', ')" -ForegroundColor Cyan
                }
            } else {
                Write-Warning "No valid IPs found in CSV file. Trying alternative parsing method..."
                
                # Alternative method: Read line by line
                $lines = Get-Content -Path $ExcludeCsv | Select-Object -Skip 1
                foreach ($line in $lines) {
                    $fields = $line -split "`t"
                    if ($fields.Count -ge 3) {
                        $ipValue = $fields[2].Trim()
                        if ($ipValue -match '^\d+\.\d+\.\d+\.\d+$') {
                            $excludedIPs[$ipValue] = $true
                            $excludedCount++
                        }
                    }
                }
                
                if ($excludedCount -gt 0) {
                    Write-Host "Successfully loaded $excludedCount IPs using alternative method" -ForegroundColor Green
                } else {
                    Write-Warning "Still no IPs found. Continuing without exclusions..."
                }
            }
        } catch {
            Write-Warning "Failed to parse CSV: $($_.Exception.Message)"
            Write-Warning "Continuing without exclusions..."
            $excludedIPs = @{}
        }
    } catch {
        Write-Warning "Failed to load CSV file: $($_.Exception.Message)"
        Write-Warning "Continuing without exclusions..."
        $excludedIPs = @{}
    }
} else {
    Write-Warning "Exclusion CSV file not found: $ExcludeCsv"
    Write-Warning "Continuing without exclusions..."
}

# Show total exclusion count
Write-Host "Total IPs in exclusion list: $($excludedIPs.Count)" -ForegroundColor Cyan

# Initialize CSV with additional IP columns (without DNS flush status)
Write-Host "Initializing log file: $LogFile..." -ForegroundColor Yellow
try {
    $csvHeader = "Timestamp,IP,Gateway_Ping,Internet_Ping,Gateway_MS"
    foreach ($addIP in $additionalIPs) {
        $csvHeader += ",$($addIP)_Ping,$($addIP)_MS"
    }
    $csvHeader += ",Notes"
    $csvHeader | Out-File -FilePath $LogFile -Encoding UTF8 -ErrorAction Stop
    Write-Host "Log file initialized successfully." -ForegroundColor Green
} catch {
    Write-Error "Failed to create log file: $($_.Exception.Message)"
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

$expectedTotalIPs = (254 - 40 + 1) + (3 * 254)  # 215 + 762 = 977 IPs (starting from 10.8.24.40)
$skippedCount = 0
Write-Host "`n========== Starting IP Range Test ==========" -ForegroundColor Cyan
Write-Host "Results will be saved to: $LogFile" -ForegroundColor Cyan
Write-Host "Testing $expectedTotalIPs IPs (10.8.24.40 → 10.8.27.254)..." -ForegroundColor Yellow
Write-Host "Network Configuration:" -ForegroundColor Yellow
Write-Host "  Subnet Mask: $SubnetMask (/$Prefix)" -ForegroundColor Gray
Write-Host "  Gateway: $Gateway" -ForegroundColor Gray
Write-Host "  DNS Servers: $($DNSServers -Join ', ')" -ForegroundColor Gray
Write-Host "Additional IPs to ping: $($additionalIPs -Join ', ')" -ForegroundColor Yellow
Write-Host "Excluding $($excludedIPs.Count) IPs from CSV file" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop at any time`n" -ForegroundColor Gray

# Small delay to ensure user sees the messages
Start-Sleep -Seconds 2

$totalIPs = 0
$successCount = 0

try {
    for ($i = 24; $i -le 27; $i++) {
        # Start from 40 for 10.8.24.x range, otherwise start from 1
        $startJ = if ($i -eq 24) { 40 } else { 1 }
        for ($j = $startJ; $j -le 254; $j++) {
            $ip = "10.8.$i.$j"
            $totalIPs++
            
            Write-Progress -Activity "Testing IP Range" -Status "Testing $ip ($totalIPs/$expectedTotalIPs)" -PercentComplete (($totalIPs / $expectedTotalIPs) * 100)
            
            # Check if IP should be excluded - MORE EXPLICIT CHECK
            $shouldExclude = $false
            if ($excludedIPs.ContainsKey($ip)) {
                $shouldExclude = $true
            }
            
            if ($shouldExclude) {
                $skippedCount++
                Write-Host "$ip - SKIPPED (in exclusion list)" -ForegroundColor Gray
                continue
            }
            
            try {
                # Get adapter interface index
                $adapterInterface = (Get-NetAdapter -Name $Adapter).ifIndex
                
                # Remove existing IP addresses on this adapter
                $existingIPs = Get-NetIPAddress -InterfaceAlias $Adapter -ErrorAction SilentlyContinue
                if ($existingIPs) {
                    $existingIPs | Remove-NetIPAddress -Confirm:$false -ErrorAction SilentlyContinue | Out-Null
                    Start-Sleep -Milliseconds 300
                }
                
                # Remove existing default gateway routes (0.0.0.0/0) on this adapter
                $existingRoutes = Get-NetRoute -InterfaceIndex $adapterInterface -DestinationPrefix "0.0.0.0/0" -ErrorAction SilentlyContinue
                if ($existingRoutes) {
                    $existingRoutes | Remove-NetRoute -Confirm:$false -ErrorAction SilentlyContinue | Out-Null
                    Start-Sleep -Milliseconds 300
                }
                
                # Also remove any routes to the gateway IP specifically
                $gatewayRoutes = Get-NetRoute -InterfaceIndex $adapterInterface -NextHop $Gateway -ErrorAction SilentlyContinue
                if ($gatewayRoutes) {
                    $gatewayRoutes | Remove-NetRoute -Confirm:$false -ErrorAction SilentlyContinue | Out-Null
                    Start-Sleep -Milliseconds 300
                }
                
                Start-Sleep -Milliseconds 500
                
                # Assign new IP with gateway
                New-NetIPAddress -InterfaceAlias $Adapter -IPAddress $ip -PrefixLength $Prefix -DefaultGateway $Gateway -ErrorAction Stop | Out-Null
                Start-Sleep -Seconds 2  # Increased delay to allow network stack to initialize
                
                # Verify IP was assigned correctly
                $assignedIP = Get-NetIPAddress -InterfaceAlias $Adapter -AddressFamily IPv4 -ErrorAction SilentlyContinue | Where-Object { $_.IPAddress -eq $ip }
                if (-not $assignedIP) {
                    throw "Failed to verify IP $ip was assigned"
                }
                
                # Set DNS servers (supports multiple DNS servers)
                Set-DnsClientServerAddress -InterfaceAlias $Adapter -ServerAddresses $DNSServers -ErrorAction Stop | Out-Null
                Start-Sleep -Milliseconds 500
                
                # Register DNS to force network registration
                try {
                    Register-DnsClient -ErrorAction SilentlyContinue | Out-Null
                } catch {
                    # Ignore errors as this is optional
                }
                
                # Additional wait to ensure network is fully ready
                Start-Sleep -Milliseconds 500
                
                # Verify network interface is ready by checking route table and interface status
                $routeReady = $false
                $routeCheckCount = 0
                while (-not $routeReady -and $routeCheckCount -lt 10) {
                    $adapterStatus = Get-NetAdapter -Name $Adapter -ErrorAction SilentlyContinue
                    $routeCheck = Get-NetRoute -InterfaceAlias $Adapter -DestinationPrefix "0.0.0.0/0" -ErrorAction SilentlyContinue
                    if ($routeCheck -and $adapterStatus -and $adapterStatus.Status -eq 'Up') {
                        $routeReady = $true
                    } else {
                        Start-Sleep -Milliseconds 500
                        $routeCheckCount++
                    }
                }
                
                # Small delay after route is ready
                if ($routeReady) {
                    Start-Sleep -Milliseconds 500
                }
                
                # Test gateway
                $gatewayTest = Test-Connection -ComputerName $Gateway -Count $PingCount -ErrorAction SilentlyContinue
                $gatewayStatus = if ($gatewayTest) { "Success" } else { "Failed" }
                $gatewayMS = if ($gatewayTest) { [math]::Round(($gatewayTest | Measure-Object -Property ResponseTime -Average).Average, 2) } else { "N/A" }
                
                # Test internet
                $internetTest = Test-Connection -ComputerName "8.8.8.8" -Count $PingCount -Quiet -ErrorAction SilentlyContinue
                $internetStatus = if ($internetTest) { "Success" } else { "Failed" }
                
                # Test additional IPs
                $additionalResults = @()
                foreach ($testIP in $additionalIPs) {
                    $testResult = Test-Connection -ComputerName $testIP -Count $PingCount -ErrorAction SilentlyContinue
                    $testStatus = if ($testResult) { "Success" } else { "Failed" }
                    $testMS = if ($testResult) { [math]::Round(($testResult | Measure-Object -Property ResponseTime -Average).Average, 2) } else { "N/A" }
                    $additionalResults += $testStatus
                    $additionalResults += $testMS
                }
                
                # Log result
                $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                $logLine = "$timestamp,$ip,$gatewayStatus,$internetStatus,$gatewayMS"
                $logLine += ",$($additionalResults -Join ',')"
                $logLine += ","
                $logLine | Out-File -FilePath $LogFile -Append -Encoding UTF8
                
                # Console output
                $additionalStatusText = ""
                for ($k = 0; $k -lt $additionalIPs.Count; $k++) {
                    $statusIdx = $k * 2
                    $msIdx = $statusIdx + 1
                    $additionalStatusText += " | $($additionalIPs[$k]): $($additionalResults[$statusIdx])"
                    if ($additionalResults[$statusIdx] -eq "Success") {
                        $additionalStatusText += " ($($additionalResults[$msIdx]) ms)"
                    }
                }
                
                $color = if ($gatewayStatus -eq "Success" -and $internetStatus -eq "Success") { 
                    $successCount++
                    "Green" 
                } elseif ($gatewayStatus -eq "Success") { 
                    "Yellow" 
                } else { 
                    "Red" 
                }
                Write-Host "$ip - GW: $gatewayStatus ($gatewayMS ms) | Internet: $internetStatus$additionalStatusText" -ForegroundColor $color
                
            } catch {
                $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                $errorMsg = $_.Exception.Message -replace ",", ";"  # Replace commas in error message to avoid CSV issues
                
                # Build log line with all columns (empty for additional IPs on error)
                $logLine = "$timestamp,$ip,Error,Error,N/A"
                foreach ($testIP in $additionalIPs) {
                    $logLine += ",Error,N/A"
                }
                $logLine += ",$errorMsg"
                $logLine | Out-File -FilePath $LogFile -Append -Encoding UTF8
                
                Write-Host "$ip - Configuration Error: $($_.Exception.Message)" -ForegroundColor Red
            }
            
            Start-Sleep -Seconds $DelaySeconds
        }
    }
} catch {
    Write-Error "Fatal error in main loop: $($_.Exception.Message)"
    Write-Error "Stack trace: $($_.ScriptStackTrace)"
} finally {
    Write-Progress -Activity "Testing IP Range" -Completed
    Write-Host "`n========== TEST COMPLETE ==========" -ForegroundColor Cyan
    Write-Host "Total IPs Tested: $totalIPs" -ForegroundColor White
    Write-Host "Skipped (Excluded): $skippedCount" -ForegroundColor Gray
    Write-Host "Tested: $($totalIPs - $skippedCount)" -ForegroundColor White
    Write-Host "Successful: $successCount" -ForegroundColor Green
    Write-Host "Failed: $(($totalIPs - $skippedCount) - $successCount)" -ForegroundColor Red
    Write-Host "Results saved to: $LogFile" -ForegroundColor Yellow
    Write-Host "`nTip: Open CSV in Excel to filter/sort results" -ForegroundColor Gray
    Write-Host "`nPress any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}


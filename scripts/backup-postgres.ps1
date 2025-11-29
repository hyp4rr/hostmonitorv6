param(
    [string]$DbHost = "127.0.0.1",
    [int]$Port = 5432,
    [string]$Database = "hostmonitordb",
    [string]$User = "hyper",
    [string]$Password = "hyper",
    [string]$PgDumpPath = "C:\Program Files\pgAdmin 4\runtime\pg_dump.exe",
    [string]$OutputDir = "storage\backups"
)

if (-not (Test-Path $PgDumpPath)) {
    Write-Error "pg_dump not found at $PgDumpPath"
    exit 1
}

$timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null

try {
    $env:PGPASSWORD = $Password
    $outputFile = Join-Path $OutputDir "$($Database)_$timestamp.sql"
& $PgDumpPath -h $DbHost -p $Port -U $User $Database | Out-File -FilePath $outputFile -Encoding UTF8
    Write-Output "Backup saved to $outputFile"
}
finally {
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}


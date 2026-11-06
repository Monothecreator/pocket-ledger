param([Parameter(Mandatory=$true)][string]$Recipient)

if (-not (Get-Command age -ErrorAction SilentlyContinue)) { throw "Install a reviewed age release and add it to PATH before running encrypted backups." }

$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$archive = Join-Path $env:TEMP "pocket-ledger-$timestamp.dump"
$encrypted = "$archive.age"
docker compose exec -T db pg_dump -U "$env:POSTGRES_USER" -d "$env:POSTGRES_DB" -Fc > $archive
if ($LASTEXITCODE -ne 0) { throw "Database backup failed." }
age -r $Recipient -o $encrypted $archive
if ($LASTEXITCODE -ne 0) { Remove-Item $archive -Force; throw "Encryption failed; plaintext backup removed." }
Remove-Item $archive -Force
Write-Output "Encrypted backup created: $encrypted"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

Write-Host "Installing Kira..."

if (-not (Test-Path "$root\node_modules")) {
    Write-Host "Installing node modules..."
    npm install
}

$binDir = "$HOME\bin"
if (-not (Test-Path $binDir)) {
    New-Item -ItemType Directory -Path $binDir | Out-Null
}

$wrapper = Join-Path $binDir 'kira.cmd'
@"
@echo off
cd /d "$root"
node src\index.js %*
"@ | Set-Content -Path $wrapper -Encoding ASCII

$currentPath = [Environment]::GetEnvironmentVariable('Path', 'User')
if ($currentPath -notlike "*$binDir*") {
    [Environment]::SetEnvironmentVariable('Path', "$currentPath;$binDir", 'User')
    Write-Host "Added $binDir to user PATH. Restart PowerShell to use the 'kira' command."
} else {
    Write-Host "$binDir is already in PATH."
}

Write-Host "Kira install complete. Use 'kira' in a new shell to start."
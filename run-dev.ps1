# run-dev.ps1 - Start the dev server (works when npm is not in PATH)
$ErrorActionPreference = "Stop"
$projectRoot = $PSScriptRoot
Set-Location $projectRoot

# Add common Node.js install locations to PATH for this session
$nodePaths = @(
    "C:\Program Files\nodejs",
    "${env:ProgramFiles}\nodejs",
    "${env:ProgramFiles(x86)}\nodejs",
    "$env:APPDATA\npm",
    "$env:LOCALAPPDATA\Programs\node"
)
foreach ($p in $nodePaths) {
    if (Test-Path $p) { $env:PATH = "$p;$env:PATH" }
}

# If using nvm-windows, use current node version
$nvmPath = "$env:APPDATA\nvm"
if (Test-Path $nvmPath) {
    $nvmCurrent = Get-Content "$nvmPath\alias\default" -ErrorAction SilentlyContinue
    if ($nvmCurrent -and (Test-Path "$nvmPath\$nvmCurrent")) {
        $env:PATH = "$nvmPath\$nvmCurrent;$env:PATH"
    }
}

# Check for node
$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeCmd) {
    Write-Host "Node.js was not found. Please install it from https://nodejs.org (LTS) and ensure 'Add to PATH' is checked." -ForegroundColor Red
    Write-Host "Then close and reopen your terminal and run: npm run dev" -ForegroundColor Yellow
    exit 1
}

Write-Host "Using Node: $($nodeCmd.Source)" -ForegroundColor Green
Write-Host "Starting dev server... (Ctrl+C to stop)" -ForegroundColor Cyan
& npm run dev

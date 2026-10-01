# Copies the basil.js library from this repository to Documents\basiljs,
# where Basil scripts look for it (see @includepath in the .jsx files).
# An existing installation is left as it is.
# Usage: powershell -ExecutionPolicy Bypass -File install_basil.ps1
Set-Location $PSScriptRoot
$target = Join-Path $env:USERPROFILE "Documents\basiljs"

if (Test-Path (Join-Path $target "basil.js")) {
  Write-Host "basil.js is already installed in $target - nothing to do."
  exit 0
}

# a folder or link without basil.js, e.g. a link to a folder that was moved
if (Get-Item $target -Force -ErrorAction SilentlyContinue) {
  Write-Host "$target exists, but contains no basil.js."
  Write-Host "Remove it and run this script again."
  exit 1
}

New-Item -ItemType Directory -Force (Split-Path $target) | Out-Null
Copy-Item basiljs $target -Recurse
Write-Host "basil.js installed in $target"

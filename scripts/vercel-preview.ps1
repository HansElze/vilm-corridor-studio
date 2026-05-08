$wrapper = "C:\Users\dvdel\OneDrive\Desktop\Agents\scripts\invoke_vercel.ps1"

if (-not (Test-Path $wrapper)) {
    Write-Error "Vercel wrapper not found: $wrapper"
    exit 1
}

C:\WINDOWS\System32\WindowsPowerShell\v1.0\powershell.exe -ExecutionPolicy Bypass -File $wrapper deploy
exit $LASTEXITCODE

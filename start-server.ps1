# Bu script yerel web sunucusunu başlatır
# PowerShell'de çalıştırın:  .\start-server.ps1

# Geçerli dizine git
Set-Location -Path $PSScriptRoot

# Python HTTP sunucusunu başlat
python -m http.server 8000

# Eğer python komutu çalışmazsa şunu dene:
# py -m http.server 8000

Write-Host "Server başlatıldı: http://localhost:8000" 
$ErrorActionPreference = 'Stop'
$studioRoot = Join-Path $PSScriptRoot 'prototype'
$studioPort = 4187
$studioListening = Get-NetTCPConnection -LocalAddress '127.0.0.1' -LocalPort $studioPort -State Listen -ErrorAction SilentlyContinue
if (-not $studioListening) {
    $studioPython = (Get-Command python -ErrorAction Stop).Source
    Start-Process -FilePath $studioPython -ArgumentList @('-m', 'http.server', "$studioPort", '--bind', '127.0.0.1') -WorkingDirectory $studioRoot -WindowStyle Hidden
}
Start-Process 'http://127.0.0.1:4187/'

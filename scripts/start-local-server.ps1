$root = Split-Path -Parent $PSScriptRoot
$serverScript = Join-Path $PSScriptRoot 'local-static-server.mjs'
$node = (Get-Command node -ErrorAction Stop).Source

Start-Process `
  -FilePath $node `
  -ArgumentList ('"' + $serverScript + '"') `
  -WorkingDirectory $root `
  -WindowStyle Hidden

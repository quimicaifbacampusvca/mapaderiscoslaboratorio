# Servidor de arquivos estáticos do aplicativo, usando apenas PowerShell/.NET do Windows.
# Fallback para quando Python 3 não estiver disponível. Somente 127.0.0.1:8765.
param([int]$Port = 8765)
$ErrorActionPreference = 'Stop'
$root = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, $Port)
$allowed = @('.html', '.css', '.js', '.json', '.webmanifest', '.svg', '.png')
$ct = @{
 '.html'='text/html; charset=utf-8'; '.css'='text/css; charset=utf-8'
 '.js'='text/javascript; charset=utf-8'; '.json'='application/json'
 '.webmanifest'='application/manifest+json'; '.svg'='image/svg+xml'
 '.png'='image/png'
}
try {
 $listener.Start()
 $url = "http://127.0.0.1:$Port/"
 Write-Host "Mapa de Riscos: $url" -ForegroundColor Cyan
 Write-Host 'O servidor aceita somente conexoes deste computador; use Ctrl+C para encerrar.'
 try { Start-Process $url } catch { Write-Host 'Abra o endereco informado no navegador.' }
 while ($true) {
  $client = $listener.AcceptTcpClient()
  try {
   $client.ReceiveTimeout = 10000
   $stream = $client.GetStream()
   $reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
   $line = $reader.ReadLine()
   if ([string]::IsNullOrWhiteSpace($line)) { continue }
   $parts = $line.Split(' ')
   while ($true) {
    $h = $reader.ReadLine()
    if ([string]::IsNullOrEmpty($h)) { break }
   }
   $status='404 Not Found'; $body=[System.Text.Encoding]::UTF8.GetBytes('Arquivo nao encontrado'); $type='text/plain; charset=utf-8'
   if ($parts.Length -ge 2 -and ($parts[0] -eq 'GET' -or $parts[0] -eq 'HEAD')) {
    try {
     $uriPath = ([Uri]::UnescapeDataString(($parts[1] -split '\?')[0])).Replace('\','/')
     $segments = $uriPath.Trim('/').Split('/')
     $valid = -not ($segments | Where-Object { $_ -eq '..' -or $_ -eq '.' -or $_.StartsWith('.') })
     if ($uriPath -eq '/') { $uriPath='/index.html' }
     $ext=[System.IO.Path]::GetExtension($uriPath).ToLowerInvariant()
     $allowedArea = ($uriPath -match '^/(js|css|assets)/') -or ($uriPath -eq '/index.html') -or ($uriPath -eq '/sw.js') -or ($uriPath -eq '/manifest.webmanifest')
     $filePath=[System.IO.Path]::GetFullPath((Join-Path $root ($uriPath.TrimStart('/').Replace('/',[System.IO.Path]::DirectorySeparatorChar))))
     if ($valid -and $allowedArea -and $allowed.Contains($ext) -and $filePath.StartsWith($root+[System.IO.Path]::DirectorySeparatorChar,[System.StringComparison]::OrdinalIgnoreCase) -and [System.IO.File]::Exists($filePath)) {
      $body=[System.IO.File]::ReadAllBytes($filePath);$status='200 OK';$type=$ct[$ext]
     }
    } catch { }
   } else { $status='405 Method Not Allowed' }
   $head="HTTP/1.1 $status`r`nContent-Type: $type`r`nContent-Length: $($body.Length)`r`nConnection: close`r`nCache-Control: no-cache`r`nX-Content-Type-Options: nosniff`r`n`r`n"
   $data=[System.Text.Encoding]::ASCII.GetBytes($head)
   $stream.Write($data,0,$data.Length)
   if ($parts.Length -lt 1 -or $parts[0] -ne 'HEAD') { $stream.Write($body,0,$body.Length) }
   $stream.Flush()
  } catch { Write-Warning "Erro no atendimento de requisicao: $_" }
  finally { $client.Close() }
 }
} finally { $listener.Stop() }

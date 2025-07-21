Add-Type -AssemblyName System.Net.HttpListener

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add('http://+:8000/')
$listener.Start()

Write-Host "Servidor rodando em http://localhost:8000"
Write-Host "Para acessar do celular, use o IP da sua máquina na porta 8000"
Write-Host "Pressione Ctrl+C para parar o servidor"

# Obter IP da máquina
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -notlike "*Loopback*" -and $_.InterfaceAlias -notlike "*VMware*"} | Select-Object -First 1).IPAddress
Write-Host "Acesse do celular: http://$ip`:8000"

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $localPath = $request.Url.LocalPath
        if ($localPath -eq '/') { 
            $localPath = '/index.html' 
        }
        
        $filePath = Join-Path (Get-Location) $localPath.TrimStart('/')
        
        if (Test-Path $filePath) {
            $content = [System.IO.File]::ReadAllBytes($filePath)
            
            # Definir Content-Type baseado na extensão
            $extension = [System.IO.Path]::GetExtension($filePath).ToLower()
            switch ($extension) {
                '.html' { $response.ContentType = 'text/html; charset=utf-8' }
                '.css' { $response.ContentType = 'text/css' }
                '.js' { $response.ContentType = 'application/javascript' }
                '.png' { $response.ContentType = 'image/png' }
                '.jpg' { $response.ContentType = 'image/jpeg' }
                '.jpeg' { $response.ContentType = 'image/jpeg' }
                '.gif' { $response.ContentType = 'image/gif' }
                '.mp3' { $response.ContentType = 'audio/mpeg' }
                default { $response.ContentType = 'application/octet-stream' }
            }
            
            $response.ContentLength64 = $content.Length
            $response.OutputStream.Write($content, 0, $content.Length)
        } else {
            $response.StatusCode = 404
            $errorContent = [System.Text.Encoding]::UTF8.GetBytes('404 - Arquivo não encontrado')
            $response.ContentType = 'text/plain; charset=utf-8'
            $response.OutputStream.Write($errorContent, 0, $errorContent.Length)
        }
        
        $response.OutputStream.Close()
        
        Write-Host "$($request.HttpMethod) $($request.Url.LocalPath) - $($response.StatusCode)"
    }
    catch {
        Write-Host "Erro: $_"
        break
    }
}

$listener.Stop()
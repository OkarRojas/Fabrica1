$token = 'TEST-3021421475891725-042119-3c5092aa525b4aae532c09eb47a35ce0-3351056559'
$headers = @{
    'Authorization' = 'Bearer ' + $token
    'Content-Type' = 'application/json'
}
$body = @{
    items = @(
        @{
            title = 'Item ROZVI Prueba'
            quantity = 1
            unit_price = 1000
            currency_id = 'COP'
        }
    )
    payer = @{
        name = 'Test User'
        email = 'test_user_123@testuser.com'
        phone = @{
            number = '3000000000'
        }
    }
    notification_url = 'http://localhost:8000/pagos/webhook'
    external_reference = 'REF-123456'
    statement_descriptor = 'ROZVI'
    back_urls = @{
        success = 'https://rozvi.com/success'
        failure = 'https://rozvi.com/failure'
        pending = 'https://rozvi.com/pending'
    }
    auto_return = 'approved'
} | ConvertTo-Json -Depth 10

try {
    $res = Invoke-WebRequest -Uri 'https://api.mercadopago.com/checkout/preferences' -Method Post -Headers $headers -Body $body -UseBasicParsing
    Write-Host 'STATUS:' $res.StatusCode
    $res.Content
} catch {
    Write-Host 'STATUS:' $_.Exception.Response.StatusCode.value__
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $reader.ReadToEnd()
}

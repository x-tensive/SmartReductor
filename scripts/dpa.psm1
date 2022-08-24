$ErrorActionPreference = "Stop"

function DPA-Login([string] $url, [string] $userName, [string] $password)
{
    $global:dpaApi = $url
    if (-not $url.EndsWith("/")) { $global:dpaApi += "/" }
    $global:dpaApi += "api"

    $loginUrl = $global:dpaApi + "/Account/Login"

    $loginBody = @{
        UserName = $userName
        Password = $password
    } | ConvertTo-Json

    $result = Invoke-WebRequest -Method "Post" -Uri $loginUrl -Body $loginBody -ContentType "application/json" -SessionVariable "session"
    
    $global:dpaSession = $session
    $global:dpaCookie = $result.Headers["Set-Cookie"]
}

function DPA-Logout()
{
    $logoutUrl = $global:dpaApi + "/Account/Logout"
    $headers = @{ Cookie = $global:dpaCookie }

    Invoke-WebRequest -Method "Post" -Uri $logoutUrl -Headers $headers -WebSession $global:dpaSession -SkipHttpErrorCheck > $null

    $global:dpaSession = $null
    $global:dpaCookie = $null
}

function DPA-GetHost()
{
    $getHostUrl = $global:dpaApi + "/DPA/getHost"
    $headers = @{ Cookie = $global:dpaCookie }

    return Invoke-RestMethod -Method "Get" -Uri $getHostUrl -Headers $headers -WebSession $global:dpaSession
}
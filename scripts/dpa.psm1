$ErrorActionPreference = "Stop"

function DPA-version-parse([string] $version)
{
    $versionItems = $version.Split(".")
    return @{
        major = $versionItems[0] -as [int]
        minor = $versionItems[1] -as [int]
        revision = $versionItems[2] -as [int]
        build = $versionItems[3] -as [int]
    }
}

function DPA-version-lowerThan([string] $version)
{
    $dpaVersion = DPA-version-parse $global:dpaHostVersion
    $targetVersion = DPA-version-parse $version

    if ($dpaVersion.major -ne $targetVersion.major) {
        return ($dpaVersion.major -lt $targetVersion.major)
    }

    if ($dpaVersion.minor -ne $targetVersion.minor) {
        return ($dpaVersion.minor -lt $targetVersion.minor)
    }

    if ($dpaVersion.revision -ne $targetVersion.revision) {
        return ($dpaVersion.revision -lt $targetVersion.revision)
    }

    if ($dpaVersion.build -ne $targetVersion.build) {
        return ($dpaVersion.build -lt $targetVersion.build)
    }

    return $false;
}

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

    $dpaHost = DPA-GetHost
    $global:dpaHostName = $dpaHost.name
    $global:dpaHostVersion = $dpaHost.dpaHostVersion
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

function DPA-GetEnterpriseStruct([Int32] $parentTypeId, [string] $parentId)
{
    if ((DPA-version-lowerThan "5.8.0.0")) {
        $getStructUrl = $global:dpaApi + "/DpaEnterpriseStrusture/getDynamicTree/" + $parentTypeId + "/" + $parentId + "/false"
    } else {
        $getStructUrl = $global:dpaApi + "/ManageEnterpriseStructure/getDynamicTree/" + $parentTypeId + "/" + $parentId
    }
    $headers = @{ Cookie = $global:dpaCookie }

    return Invoke-RestMethod -Method "Get" -Uri $getStructUrl -Headers $headers -WebSession $global:dpaSession
}

function DPA-WorkCenter-remove($id)
{
    $removeUrl = $global:dpaApi + "/DpaEnterpriseStrusture/removeEquipment/" + $id
    $headers = @{ Cookie = $global:dpaCookie }

    return Invoke-RestMethod -Method "Post" -Uri $removeUrl -Headers $headers -WebSession $global:dpaSession
}

function DPA-StorageZone-remove($id)
{
    $removeUrl = $global:dpaApi + "/DpaEnterpriseStrusture/removeStorageZone/" + $id
    $headers = @{ Cookie = $global:dpaCookie }

    return Invoke-RestMethod -Method "Post" -Uri $removeUrl -Headers $headers -WebSession $global:dpaSession
}

function DPA-Department-create($siteId, $parentDepartmentId, [string] $name)
{
    $removeUrl = $global:dpaApi + "/DpaEnterpriseStrusture/createDepartment"
    $headers = @{ Cookie = $global:dpaCookie }
    
    $bodyRaw = @{
        siteId = $siteId
        name = $name
    }
    if ($parentDepartmentId) {
        $bodyRaw.ownerDepartmentId = $parentDepartmentId
    }
    $bodyData = $bodyRaw | ConvertTo-Json
    $body = [System.Text.Encoding]::UTF8.GetBytes($bodyData)

    return Invoke-RestMethod -Method "Post" -Uri $removeUrl -Headers $headers -Body $body  -ContentType "application/json" -WebSession $global:dpaSession
}

function DPA-Department-remove($id)
{
    $removeUrl = $global:dpaApi + "/DpaEnterpriseStrusture/removeDepartment/" + $id
    $headers = @{ Cookie = $global:dpaCookie }

    return Invoke-RestMethod -Method "Post" -Uri $removeUrl -Headers $headers -WebSession $global:dpaSession
}

function DPA-Site-create($enterpriseId, [string] $name)
{
    $removeUrl = $global:dpaApi + "/DpaEnterpriseStrusture/createSite"
    $headers = @{ Cookie = $global:dpaCookie }
    
    $bodyData = @{
        enterpriseId = $enterpriseId
        name = $name
    } | ConvertTo-Json
    $body = [System.Text.Encoding]::UTF8.GetBytes($bodyData)

    return Invoke-RestMethod -Method "Post" -Uri $removeUrl -Headers $headers -Body $body  -ContentType "application/json" -WebSession $global:dpaSession
}

function DPA-Site-remove($id)
{
    $removeUrl = $global:dpaApi + "/DpaEnterpriseStrusture/removeSite/" + $id
    $headers = @{ Cookie = $global:dpaCookie }

    return Invoke-RestMethod -Method "Post" -Uri $removeUrl -Headers $headers -WebSession $global:dpaSession
}

function DPA-Enterprise-create([string] $name)
{
    $removeUrl = $global:dpaApi + "/DpaEnterpriseStrusture/create"
    $headers = @{ Cookie = $global:dpaCookie }
    
    $bodyData = @{
        name = $name
    } | ConvertTo-Json
    $body = [System.Text.Encoding]::UTF8.GetBytes($bodyData)

    return Invoke-RestMethod -Method "Post" -Uri $removeUrl -Headers $headers -Body $body  -ContentType "application/json" -WebSession $global:dpaSession
}

function DPA-Enterprise-remove($id)
{
    $removeUrl = $global:dpaApi + "/DpaEnterpriseStrusture/removeEnterprise/" + $id
    $headers = @{ Cookie = $global:dpaCookie }

    return Invoke-RestMethod -Method "Post" -Uri $removeUrl -Headers $headers -WebSession $global:dpaSession
}
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
    } | ConvertTo-Json -Depth 100

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

#
# Enums
#

function DPA-ScheduleTemplateType-getEnumValues()
{
    $getEnumUrl = $global:dpaApi + "/schedule/getEnumValues/ScheduleTemplateType"
    $headers = @{ Cookie = $global:dpaCookie }
    
    return Invoke-RestMethod -Method "Get" -Uri $getEnumUrl -Headers $headers -WebSession $global:dpaSession
}

function DPA-ScheduleOwnerType-getEnumValues()
{
    $getEnumUrl = $global:dpaApi + "/schedule/getEnumValues/ScheduleOwnerType"
    $headers = @{ Cookie = $global:dpaCookie }
    
    return Invoke-RestMethod -Method "Get" -Uri $getEnumUrl -Headers $headers -WebSession $global:dpaSession
}


#
# Enterprise structure
#

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

function DPA-WorkCenter-create($departmentId, [string] $name)
{
    $removeUrl = $global:dpaApi + "/DpaEnterpriseStrusture/createEquipment"
    $headers = @{ Cookie = $global:dpaCookie }
    
    $bodyData = @{
        departmentId = $departmentId
        name = $name
        serverId = 0
        driverIdentifier = "00000000-0000-0000-0000-000000000000"
        equipmentGroupIds = @()
	    equipmentGroupNames = $null
    } | ConvertTo-Json -Depth 100
    $body = [System.Text.Encoding]::UTF8.GetBytes($bodyData)

    return Invoke-RestMethod -Method "Post" -Uri $removeUrl -Headers $headers -Body $body  -ContentType "application/json" -WebSession $global:dpaSession
}

function DPA-WorkCenter-remove($id)
{
    $removeUrl = $global:dpaApi + "/DpaEnterpriseStrusture/removeEquipment/" + $id
    $headers = @{ Cookie = $global:dpaCookie }

    return Invoke-RestMethod -Method "Post" -Uri $removeUrl -Headers $headers -WebSession $global:dpaSession
}

function DPA-StorageZone-create($departmentId, [string] $name, [string] $address)
{
    $removeUrl = $global:dpaApi + "/storageZone"
    $headers = @{ Cookie = $global:dpaCookie }
    
    $bodyData = @{
        IdDepartament = $departmentId
        name = $name
        address = $address
    } | ConvertTo-Json -Depth 100
    $body = [System.Text.Encoding]::UTF8.GetBytes($bodyData)

    return Invoke-RestMethod -Method "Post" -Uri $removeUrl -Headers $headers -Body $body  -ContentType "application/json" -WebSession $global:dpaSession
}

function DPA-StorageZone-remove($id)
{
    $removeUrl = $global:dpaApi + "/storageZone/" + $id
    $headers = @{ Cookie = $global:dpaCookie }

    return Invoke-RestMethod -Method "Delete" -Uri $removeUrl -Headers $headers -WebSession $global:dpaSession
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
    $bodyData = $bodyRaw | ConvertTo-Json -Depth 100
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
    } | ConvertTo-Json -Depth 100
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
    } | ConvertTo-Json -Depth 100
    $body = [System.Text.Encoding]::UTF8.GetBytes($bodyData)

    return Invoke-RestMethod -Method "Post" -Uri $removeUrl -Headers $headers -Body $body -ContentType "application/json" -WebSession $global:dpaSession
}

function DPA-Enterprise-remove($id)
{
    $removeUrl = $global:dpaApi + "/DpaEnterpriseStrusture/removeEnterprise/" + $id
    $headers = @{ Cookie = $global:dpaCookie }

    return Invoke-RestMethod -Method "Post" -Uri $removeUrl -Headers $headers -WebSession $global:dpaSession
}

#
# Shifts
#

function DPA-ShiftScheduleTemplates-getAll()
{
    $getAllUrl = $global:dpaApi + "/referenceBook/getReferenceBookDatas/ScheduleTemplate"
    $headers = @{ Cookie = $global:dpaCookie }

    $bodyData = @{
    } | ConvertTo-Json -Depth 100
    $body = [System.Text.Encoding]::UTF8.GetBytes($bodyData)

    return Invoke-RestMethod -Method "Post" -Uri $getAllUrl -Headers $headers -Body $body -ContentType "application/json" -WebSession $global:dpaSession
}

function DPA-ShiftScheduleTemplate-get($id)
{
    $getUrl = $global:dpaApi + "/schedule/getScheduleTemplateRecord/" + $id
    $headers = @{ Cookie = $global:dpaCookie }

    return Invoke-RestMethod -Method "Post" -Uri $getUrl -Headers $headers -WebSession $global:dpaSession
}

function DPA-ShiftScheduleTemplate-update($template)
{
    $updateUrl = $global:dpaApi + "/schedule/saveScheduleTemplateRecord"
    $headers = @{ Cookie = $global:dpaCookie }

    $bodyData = $template | ConvertTo-Json -Depth 100
    $body = [System.Text.Encoding]::UTF8.GetBytes($bodyData)

    return Invoke-RestMethod -Method "Post" -Uri $updateUrl -Headers $headers -Body $body -ContentType "application/json" -WebSession $global:dpaSession
}

function DPA-ShiftScheduleTemplate-remove($id)
{
    $removeUrl = $global:dpaApi + "/referenceBook/removeReferenceBookRecord/ScheduleTemplate/" + $id
    $headers = @{ Cookie = $global:dpaCookie }

    return Invoke-RestMethod -Method "Post" -Uri $removeUrl -Headers $headers -WebSession $global:dpaSession
}

function DPA-ShiftScheduleTemplate-apply($ownerTypeId, $ownerId, $templateId, $start, $end)
{
    $applyUrl = $global:dpaApi + "/Schedule/applyScheduleTemplateToSchedule/" + $ownerTypeId + "/" + $ownerId + "/" + $templateId
    $headers = @{ Cookie = $global:dpaCookie }

    $bodyData = @{
        start = $start
        end = $end
    } | ConvertTo-Json -Depth 100
    $body = [System.Text.Encoding]::UTF8.GetBytes($bodyData)

    return Invoke-RestMethod -Method "Post" -Uri $applyUrl -Headers $headers -Body $body -ContentType "application/json" -WebSession $global:dpaSession
}

function DPA-ShiftScheduleTemplate-attachToParent($ownerTypeId, $ownerId)
{
    $applyUrl = $global:dpaApi + "/Schedule/attachScheduleToParent/" + $ownerTypeId + "/" + $ownerId
    $headers = @{ Cookie = $global:dpaCookie }

    # may fail if already attached to parent
    return Invoke-RestMethod -Method "Post" -Uri $applyUrl -Headers $headers -WebSession $global:dpaSession -SkipHttpErrorCheck
}

function DPA-Shifts-getAll()
{
    $getAllUrl = $global:dpaApi + "/referenceBook/getReferenceBookDatas/ShiftName"
    $headers = @{ Cookie = $global:dpaCookie }

    $bodyData = @{
    } | ConvertTo-Json -Depth 100
    $body = [System.Text.Encoding]::UTF8.GetBytes($bodyData)

    return Invoke-RestMethod -Method "Post" -Uri $getAllUrl -Headers $headers -Body $body -ContentType "application/json" -WebSession $global:dpaSession
}

function DPA-Shift-get($id)
{
    $getUrl = $global:dpaApi + "/referenceBook/getReferenceBookRecord/ShiftName/" + $id
    $headers = @{ Cookie = $global:dpaCookie }

    return Invoke-RestMethod -Method "Get" -Uri $getUrl -Headers $headers -WebSession $global:dpaSession
}

function DPA-Shift-update($shift)
{
    $updateUrl = $global:dpaApi + "/referenceBook/saveReferenceBookRecord"
    $headers = @{ Cookie = $global:dpaCookie }

    $bodyData = $shift | ConvertTo-Json -Depth 100
    $body = [System.Text.Encoding]::UTF8.GetBytes($bodyData)

    return Invoke-RestMethod -Method "Post" -Uri $updateUrl -Headers $headers -Body $body -ContentType "application/json" -WebSession $global:dpaSession
}

function DPA-Shift-remove($id)
{
    $removeUrl = $global:dpaApi + "/referenceBook/removeReferenceBookRecord/ShiftName/" + $id
    $headers = @{ Cookie = $global:dpaCookie }

    return Invoke-RestMethod -Method "Post" -Uri $removeUrl -Headers $headers -WebSession $global:dpaSession
}
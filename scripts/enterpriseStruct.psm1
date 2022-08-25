$ErrorActionPreference = "Stop"

function EnterpriseStruct-GetNodeTypeName([Int32] $typeId)
{
    if ($typeId -eq 1) { return "enterprise" }
    if ($typeId -eq 2) { return "site" }
    if ($typeId -eq 3) { return "department" }
    if ($typeId -eq 4) { return "workCenter" }
    if ($typeId -eq 26) { return "storageZone" }
    return $null
}

function EnterpriseStruct-IsContainerType([Int32] $typeId)
{
    if ($typeId -eq 1) { return $true }   # enterprise
    if ($typeId -eq 2) { return $true }   # site
    if ($typeId -eq 3) { return $true }   # department
    if ($typeId -eq 6) { return $true }   # equipment container
    if ($typeId -eq 29) { return $true }  # storage zone container
    return $false
}

function EnterpriseStruct-IsVirtualContainerType([Int32] $typeId)
{
    if ($typeId -eq 6) { return $true }   # equipment container
    if ($typeId -eq 29) { return $true }  # storage zone container
    return $false
}

function EnterpriseStruct-Configuration-DumpWorkCenter([string] $path, [object] $workCenterCfg)
{
    Write-Host ($path + $workCenterCfg.name) -NoNewLine
    Write-Host " (workCenter)" -Foreground darkgray
}

function EnterpriseStruct-Configuration-DumpStorageZone([string] $path, [object] $storageZoneCfg)
{
    Write-Host ($path + $storageZoneCfg.name) -NoNewLine
    Write-Host " (storageZone)" -Foreground darkgray
}

function EnterpriseStruct-Configuration-DumpDepartment([string] $path, [object] $departmentCfg)
{
    Write-Host ($path + $departmentCfg.name) -NoNewLine
    Write-Host " (department)" -Foreground darkgray
    foreach ($subDepartmentCfg in $departmentCfg.departments) {
        EnterpriseStruct-Configuration-DumpDepartment ($path + $departmentCfg.name + "/") $subDepartmentCfg
    }
    foreach ($workCenterCfg in $departmentCfg.workCenters) {
        EnterpriseStruct-Configuration-DumpWorkCenter ($path + $departmentCfg.name + "/") $workCenterCfg
    }
    foreach ($storageZoneCfg in $departmentCfg.storageZones) {
        EnterpriseStruct-Configuration-DumpStorageZone ($path + $departmentCfg.name + "/") $storageZoneCfg
    }
}

function EnterpriseStruct-Configuration-DumpSite([string] $path, [object] $siteCfg)
{
    Write-Host ($path + $siteCfg.name) -NoNewLine
    Write-Host " (site)" -Foreground darkgray
    foreach ($departmentCfg in $siteCfg.departments) {
        EnterpriseStruct-Configuration-DumpDepartment ($path + $siteCfg.name + "/") $departmentCfg
    }
}

function EnterpriseStruct-Configuration-DumpEnterprise([object] $enterpriseCfg)
{
    Write-Host $enterpriseCfg.name -NoNewLine
    Write-Host " (enterprise)" -Foreground darkgray
    foreach ($siteCfg in $enterpriseCfg.sites) {
        EnterpriseStruct-Configuration-DumpSite ($enterpriseCfg.name + "/") $siteCfg
    }
}

function EnterpriseStruct-ReadConfiguration()
{
    $structCfgFileName = $PSScriptRoot + "/../data/enterpriseStruct.json"
    $enterpriseCfg = Get-Content $structCfgFileName | Out-String | ConvertFrom-Json
    EnterpriseStruct-Configuration-DumpEnterprise $enterpriseCfg
}

function EnterpriseStruct-Fetch([string] $path, [Int32] $parentTypeId, [string] $parentId)
{
    $nodes = DPA-GetEnterpriseStruct $parentTypeId $parentId
    foreach ($node in $nodes) {
        $currentPath = $path
        $isVirtualContainer = EnterpriseStruct-IsVirtualContainerType $node.type
        if (-not $isVirtualContainer) {
            $nodeTypeName = EnterpriseStruct-GetNodeTypeName $node.type
            Write-Host ($path + $node.text) -NoNewLine
            Write-Host (" (" + $nodeTypeName + ")") -Foreground darkgray
            $currentPath = $path + $node.text + "/"
        }
        $isContainer = EnterpriseStruct-IsContainerType $node.type
        if ($isContainer) { EnterpriseStruct-Fetch $currentPath $node.type $node.id }
    }
}

function EnterpriseStruct-Update()
{
    Write-Host
    Write-Host "enterprise struct READ CONFIGURATION" -Foreground green
    Write-Host
    EnterpriseStruct-ReadConfiguration

    Write-Host
    Write-Host "enterprise struct FETCH" -Foreground green
    Write-Host
    EnterpriseStruct-Fetch "" 0 "0"
}
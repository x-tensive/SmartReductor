$ErrorActionPreference = "Stop"

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
    $enterpriseCfg = Get-Content $structCfgFileName | Out-String | ConvertFrom-Json -AsHashtable
    EnterpriseStruct-Configuration-DumpEnterprise $enterpriseCfg
    return $enterpriseCfg;
}

function EnterpriseStruct-FetchNodeCfg([Int32] $typeId, [string] $id, [string] $name, $parentNodeCfg)
{
    $nodeCfg = @{
        id = $id
        name = $name
    }

    # enterprise
    if ($typeId -eq 1) {
        $nodeCfg.sites = @()
        $parentNodeCfg.enterprises += $nodeCfg
    }  

    # site
    if ($typeId -eq 2) {
        $nodeCfg.departments = @()
        $parentNodeCfg.sites += $nodeCfg
    } 

    # department
    if ($typeId -eq 3) {
        $nodeCfg.departments = @()
        $nodeCfg.workCenters = @()
        $nodeCfg.storageZones = @()
        $parentNodeCfg.departments += $nodeCfg
    }

    # workCenter
    if ($typeId -eq 4) {
        $parentNodeCfg.workCenters += $nodeCfg
    }

    # storageZone
    if ($typeId -eq 26) {
        $parentNodeCfg.storageZones += $nodeCfg
    }

    return $nodeCfg
}

function EnterpriseStruct-FetchNode([Int32] $parentTypeId, [string] $parentId, $nodeCfg)
{
    $nodes = DPA-GetEnterpriseStruct $parentTypeId $parentId
    foreach ($node in $nodes) {
        $currentNodeCfg = $nodeCfg
        $isVirtualContainer = EnterpriseStruct-IsVirtualContainerType $node.type
        if (-not $isVirtualContainer) {
            $currentNodeCfg = EnterpriseStruct-FetchNodeCfg $node.type $node.id $node.text $nodeCfg
        }
        $isContainer = EnterpriseStruct-IsContainerType $node.type
        if ($isContainer) { EnterpriseStruct-FetchNode $node.type $node.id $currentNodeCfg}
    }
}

function EnterpriseStruct-Fetch()
{
    $existentCfgContainer = @{
        enterprises = @()
    }
    EnterpriseStruct-FetchNode 0 "0" $existentCfgContainer
    foreach ($enterpriseCfg in $existentCfgContainer.enterprises) { EnterpriseStruct-Configuration-DumpEnterprise $enterpriseCfg }
    return $existentCfgContainer.enterprises
}

function EnterpriseStructure-GenerateRemoveActions-workCenter($workCenterCfg, [ref] $actions)
{
    $actions.Value += @{
        actionName = "RemoveWorkCenter"
        id = $workCenterCfg.id
        name = $workCenterCfg.name
        execute = {
            param($action)
            DPA-WorkCenter-remove $action.id
        }
    }
}

function EnterpriseStructure-GenerateRemoveActions-storageZone($storageZoneCfg, [ref] $actions)
{
    $actions.Value += @{
        actionName = "RemoveStorageZone"
        id = $storageZoneCfg.id
        name = $storageZoneCfg.name
    }
}

function EnterpriseStructure-GenerateRemoveActions-department($departmentCfg, [ref] $actions)
{
    foreach ($subDepartmentCfg in $departmentCfg.departments) { EnterpriseStructure-GenerateRemoveActions-department $subDepartmentCfg $actions }
    foreach ($workCenterCfg in $departmentCfg.workCenters) { EnterpriseStructure-GenerateRemoveActions-workCenter $workCenterCfg $actions }
    foreach ($storageZoneCfg in $departmentCfg.storageZones) { EnterpriseStructure-GenerateRemoveActions-storageZone $storageZoneCfg $actions }
    $actions.Value += @{
        actionName = "RemoveDepartment"
        id = $departmentCfg.id
        name = $departmentCfg.name
    }
}

function EnterpriseStructure-GenerateRemoveActions-site($siteCfg, [ref] $actions)
{
    foreach ($departmentCfg in $siteCfg.departments) { EnterpriseStructure-GenerateRemoveActions-department $departmentCfg $actions }
    $actions.Value += @{
        actionName = "RemoveSite"
        id = $siteCfg.id
        name = $siteCfg.name
    }
}

function EnterpriseStructure-GenerateRemoveActions-enterprise($enterpriseCfg, [ref] $actions)
{
    foreach ($siteCfg in $enterpriseCfg.sites) { EnterpriseStructure-GenerateRemoveActions-site $siteCfg $actions }
    $actions.Value += @{
        actionName = "RemoveEnterprise"
        id = $enterpriseCfg.id
        name = $enterpriseCfg.name
    }
}

function EnterpriseStructure-GenerateCreateActions-workCenter($workCenterCfg, [ref] $actions)
{
    $actions.Value += @{
        actionName = "CreateWorkCenter"
        cfg = $workCenterCfg
    }
}

function EnterpriseStructure-GenerateCreateActions-storageZone($storageZoneCfg, [ref] $actions)
{
    $actions.Value += @{
        actionName = "CreateStorageZone"
        cfg = $storageZoneCfg
    }
}

function EnterpriseStructure-GenerateCreateActions-department($departmentCfg, [ref] $actions)
{
    $actions.Value += @{
        actionName = "CreateDepartment"
        cfg = $departmentCfg
    }
    foreach ($subDepartmentCfg in $departmentCfg.departments) {
        EnterpriseStructure-GenerateCreateActions-department $subDepartmentCfg $actions
    }
    foreach ($workCenterCfg in $departmentCfg.workCenters) {
        EnterpriseStructure-GenerateCreateActions-workCenter $workCenterCfg $actions
    }
    foreach ($storageZoneCfg in $departmentCfg.storageZones) {
        EnterpriseStructure-GenerateCreateActions-storageZone $storageZoneCfg $actions
    }
}

function EnterpriseStructure-GenerateCreateActions-site($siteCfg, [ref] $actions)
{
    $actions.Value += @{
        actionName = "CreateSite"
        cfg = $siteCfg
    }
    foreach ($departmentCfg in $siteCfg.departments) {
        EnterpriseStructure-GenerateCreateActions-department $departmentCfg $actions
    }
}

function EnterpriseStructure-GenerateCreateActions-enterprise($enterpriseCfg, [ref] $actions)
{
    $actions.Value += @{
        actionName = "CreateEnterprise"
        cfg = $enterpriseCfg
    }
    foreach ($siteCfg in $enterpriseCfg.sites) {
        EnterpriseStructure-GenerateCreateActions-site $siteCfg $actions
    }
}

function EnterpriseStructure-GenerateUpdateActions-workCenters([ref] $workCentersCfg, [ref] $existentWorkCentersCfg, [ref] $actions)
{
    foreach ($existentWorkCenterCfg in $existentWorkCentersCfg.Value) {
        $workCenterCfg = $workCentersCfg.Value | where { $_.name -eq $existentWorkCenterCfg.name }
        if (-not $workCenterCfg) {
            EnterpriseStructure-GenerateRemoveActions-workCenter $existentWorkCenterCfg $actions
        }
    }

    foreach ($workCenterCfg in $workCentersCfg.Value) {
        $existentWorkCenterCfg = $existentWorkCentersCfg.Value | where { $_.name -eq $workCenterCfg.name }
        if ($existentWorkCenterCfg) {
            $workCenterCfg.id = $existentWorkCenterCfg.id
        }
    }

    foreach ($workCenterCfg in $workCentersCfg.Value) {
        if (-not $workCenterCfg.ContainsKey("id")) {
            EnterpriseStructure-GenerateCreateActions-workCenter $workCenterCfg $actions
        }
    }
}

function EnterpriseStructure-GenerateUpdateActions-storageZones([ref] $storageZonesCfg, [ref] $existentStorageZonesCfg, [ref] $actions)
{
    foreach ($existentStorageZoneCfg in $existentStorageZonesCfg.Value) {
        $storageZoneCfg = $storageZonesCfg.Value | where { $_.name -eq $existentStorageZoneCfg.name }
        if (-not $storageZoneCfg) {
            EnterpriseStructure-GenerateRemoveActions-storageZone $existentStorageZoneCfg $actions
        }
    }

    foreach ($storageZoneCfg in $storageZonesCfg.Value) {
        $existentStorageZoneCfg = $existentStorageZonesCfg.Value | where { $_.name -eq $storageZoneCfg.name }
        if ($existentStorageZoneCfg) {
            $storageZoneCfg.id = $existentStorageZoneCfg.id
        }
    }

    foreach ($storageZoneCfg in $storageZonesCfg.Value) {
        if (-not $storageZoneCfg.ContainsKey("id")) {
            EnterpriseStructure-GenerateCreateActions-storageZone $storageZoneCfg $actions
        }
    }
}

function EnterpriseStructure-GenerateUpdateActions-departments([ref] $departmentsCfg, [ref] $existentDepartmentsCfg, [ref] $actions)
{
    foreach ($existentDepartmentCfg in $existentDepartmentsCfg.Value) {
        $departmentCfg = $departmentsCfg.Value | where { $_.name -eq $existentDepartmentCfg.name }
        if (-not $departmentCfg) {
            EnterpriseStructure-GenerateRemoveActions-department $existentDepartmentCfg $actions
        }
    }

    foreach ($departmentCfg in $departmentsCfg.Value) {
        $existentDepartmentCfg = $existentDepartmentsCfg.Value | where { $_.name -eq $departmentCfg.name }
        if ($existentDepartmentCfg) {
            $departmentCfg.id = $existentDepartmentCfg.id
            EnterpriseStructure-GenerateUpdateActions-departments ([ref]$departmentCfg.departments) ([ref]$existentDepartmentCfg.departments) $actions
            EnterpriseStructure-GenerateUpdateActions-workCenters ([ref]$departmentCfg.workCenters) ([ref]$existentDepartmentCfg.workCenters) $actions
            EnterpriseStructure-GenerateUpdateActions-storageZones ([ref]$departmentCfg.storageZones) ([ref]$existentDepartmentCfg.storageZones) $actions
        }
    }

    foreach ($departmentCfg in $departmentsCfg.Value) {
        if (-not $departmentCfg.ContainsKey("id")) {
            EnterpriseStructure-GenerateCreateActions-department $departmentCfg $actions
        }
    }
}

function EnterpriseStructure-GenerateUpdateActions-sites([ref] $sitesCfg, [ref] $existentSitesCfg, [ref] $actions)
{
    foreach ($existentSiteCfg in $existentSitesCfg.Value) {
        $siteCfg = $sitesCfg.Value | where { $_.name -eq $existentSiteCfg.name }
        if (-not $siteCfg) {
            EnterpriseStructure-GenerateRemoveActions-site $existentSiteCfg $actions
        }
    }

    foreach ($siteCfg in $sitesCfg.Value) {
        $existentSiteCfg = $existentSitesCfg.Value | where { $_.name -eq $siteCfg.name }
        if ($existentSiteCfg) {
            $siteCfg.id = $existentSiteCfg.id
            EnterpriseStructure-GenerateUpdateActions-departments ([ref]$siteCfg.departments) ([ref]$existentSiteCfg.departments) $actions
        }
    }

    foreach ($siteCfg in $sitesCfg.Value) {
        if (-not $siteCfg.ContainsKey("id")) {
            EnterpriseStructure-GenerateCreateActions-site $siteCfg $actions
        }
    }
}

function EnterpriseStructure-GenerateUpdateActions($enterpriseCfg, $existentCfg)
{
    $actions = @()

    foreach ($existentEnterpriseCfg in $existentCfg) {
        if ($enterpriseCfg.name -ne $existentEnterpriseCfg.name) {
            EnterpriseStructure-GenerateRemoveActions-enterprise $existentEnterpriseCfg ([ref]$actions)
        }
    }

    foreach ($existentEnterpriseCfg in $existentCfg) {
        if ($enterpriseCfg.name -eq $existentEnterpriseCfg.name) {
            $enterpriseCfg.id = $existentEnterpriseCfg.id
            EnterpriseStructure-GenerateUpdateActions-sites ([ref]$enterpriseCfg.sites) ([ref]$existentEnterpriseCfg.sites) ([ref]$actions)
        }
    }

    if (-not $enterpriseCfg.ContainsKey("id")) {
        EnterpriseStructure-GenerateCreateActions-enterprise $enterpriseCfg ([ref]$actions)
    }

    foreach ($action in $actions) {
        if ($action.actionName.StartsWith("Remove")) {
            Write-Host $action.actionName -NoNewLine -Foreground yellow
            Write-Host (" " + $action.id + ":" + $action.name)
        }
        if ($action.actionName.StartsWith("Create")) {
            Write-Host $action.actionName -NoNewLine
            Write-Host (" " + $action.cfg.name)
        }
    }

    return $actions
}

function EnterpriseStructure-ExecuteUpdateActions([ref] $updateActions)
{
    foreach ($action in $updateActions.Value) {
        if ($action.actionName.StartsWith("Remove")) {
            Write-Host $action.actionName -NoNewLine -Foreground yellow
            Write-Host (" " + $action.id + ":" + $action.name) -NoNewline
        }
        if ($action.actionName.StartsWith("Create")) {
            Write-Host $action.actionName -NoNewLine
            Write-Host (" " + $action.cfg.name) -NoNewLine
        }

        Write-Host " ..." -NoNewline

        $action.execute.Invoke($action)

        Write-Host "OK" -Foreground green
    }
}

function EnterpriseStruct-Update()
{
    Write-Host
    Write-Host "enterprise struct READ CONFIGURATION" -Foreground green
    Write-Host
    $enterpriseCfg = EnterpriseStruct-ReadConfiguration

    Write-Host
    Write-Host "enterprise struct FETCH" -Foreground green
    Write-Host
    $existentCfg = EnterpriseStruct-Fetch

    Write-Host
    Write-Host "enterprise struct UPDATE ACTIONS" -Foreground green
    Write-Host
    $updateActions = EnterpriseStructure-GenerateUpdateActions $enterpriseCfg $existentCfg

    Write-Host
    Write-Host "enterprise struct EXECUTE UPDATE ACTIONS" -Foreground green
    Write-Host
    EnterpriseStructure-ExecuteUpdateActions ([ref] $updateActions)
}
$ErrorActionPreference = "Stop"

function EnterpriseStruct-ShiftSchedule-ApplyTemplate([string] $ownerTypeName, $ownerId, $templateName, $templateBefore, $templateAfter)
{
    $ownerTypeId = ($global:shifScheduleOwnerTypeValues | where { $_.enum -eq $ownerTypeName }).id
    $templateId = ($global:shiftTemplates | where { $_.name -eq $templateName }).id
    $before = (Get-Date).AddDays(-$templateBefore).ToUniversalTime().Date.ToString("o")
    $after = (Get-Date).AddDays($templateAfter).ToUniversalTime().Date.ToString("o")
    DPA-ShiftScheduleTemplate-apply $ownerTypeId $ownerId $templateId $before $after > $null
}

function EnterpriseStruct-ShiftSchedule-AttachToParent([string] $ownerTypeName, $ownerId)
{
    $ownerTypeId = ($global:shifScheduleOwnerTypeValues | where { $_.enum -eq $ownerTypeName }).id
    DPA-ShiftScheduleTemplate-attachToParent $ownerTypeId $ownerId > $null 2> $null # may fail if already attached to parent
}

function EnterpriseStruct-ShiftSchedule-Apply([string]$ownerTypeName, $cfg)
{
    if ($cfg.inheritShiftSchedule) {
        Write-Host "AttachToParent $($cfg.id):$($cfg.name)"
        EnterpriseStruct-ShiftSchedule-AttachToParent $ownerTypeName $cfg.id
    } elseif ($cfg.shiftScheduleTemplate) {
        Write-Host "ApplyTemplate $($cfg.id):$($cfg.name) -> $($cfg.shiftScheduleTemplate)"
        EnterpriseStruct-ShiftSchedule-ApplyTemplate $ownerTypeName $cfg.id $cfg.shiftScheduleTemplate $cfg.shiftScheduleTemplate_before $cfg.shiftScheduleTemplate_after
    }
}

function EnterpriseStruct-ShiftSchedule-ExecuteUpdate-workCenter($workCenterCfg)
{
    EnterpriseStruct-ShiftSchedule-Apply "Equipment" $workCenterCfg
}

function EnterpriseStruct-ShiftSchedule-ExecuteUpdate-department($departmentCfg)
{
    EnterpriseStruct-ShiftSchedule-Apply "Department" $departmentCfg
    foreach ($subDepartmentCfg in $departmentCfg.departments) {
        EnterpriseStruct-ShiftSchedule-ExecuteUpdate-department $subDepartmentCfg
    }
    foreach ($workCenterCfg in $departmentCfg.workCenters) {
        EnterpriseStruct-ShiftSchedule-ExecuteUpdate-workCenter $workCenterCfg
    }
}

function EnterpriseStruct-ShiftSchedule-ExecuteUpdate-site($siteCfg)
{
    EnterpriseStruct-ShiftSchedule-Apply "Site" $siteCfg
    foreach ($departmentCfg in $siteCfg.departments) {
        EnterpriseStruct-ShiftSchedule-ExecuteUpdate-department $departmentCfg
    }
}

function EnterpriseStruct-ShiftSchedule-ExecuteUpdate()
{
    foreach ($enterpriseCfg in $global:enterprise) {
        EnterpriseStruct-ShiftSchedule-Apply "Enterprise" $enterpriseCfg
        foreach ($siteCfg in $enterpriseCfg.sites) {
            EnterpriseStruct-ShiftSchedule-ExecuteUpdate-site $siteCfg
        }
    }
}

function EnterpriseStruct-ShiftSchedule-Update()
{
    $global:shifScheduleOwnerTypeValues = DPA-ScheduleOwnerType-getEnumValues

    Write-Host
    Write-Host "enterprise struct shift schedule EXECUTE UPDATE" -Foreground green
    Write-Host
    EnterpriseStruct-ShiftSchedule-ExecuteUpdate
}
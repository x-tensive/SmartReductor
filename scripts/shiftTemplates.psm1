$ErrorActionPreference = "Stop"

function ShiftTemplates-Configuration-Dump($shiftTemplatesCfg)
{
   foreach ($shiftTemplateCfg in $shiftTemplatesCfg) {
        Write-Host $shiftTemplateCfg.name
    }
}

function ShiftTemplates-ReadConfiguration()
{
    $shiftTemplatesCfgFileName = $PSScriptRoot + "/../data/shiftTemplates.json"
    $shiftTemplatesCfg = Get-Content $shiftTemplatesCfgFileName | Out-String | ConvertFrom-Json -AsHashtable
    ShiftTemplates-Configuration-Dump $shiftTemplatesCfg
    return $shiftTemplatesCfg;
}

function ShiftTemplates-Fetch()
{
    $existentCfg = DPA-ShiftScheduleTemplates-getAll
    ShiftTemplates-Configuration-Dump $existentCfg
    return $existentCfg
}

function ShiftTemplates-GetShift([string] $shiftName)
{
    return ($global:shifts | where { $_.name -eq $shiftName })
}

function ShiftTemplates-ExecuteUpdate($shiftTemplatesCfg, $existentTemplatesCfg)
{
    foreach ($existentShiftTemplateCfg in $existentTemplatesCfg) {
        $shiftTemplateCfg = $shiftTemplatesCfg | where { $_.name -eq $existentShiftTemplateCfg.name }
        if ((-not $shiftTemplateCfg) -And (-not $existentShiftTemplateCfg.isSystemScheduleTemplate)) {
            Write-Host "Remove" -NoNewLine -Foreground yellow
            Write-Host (" " + $existentShiftTemplateCfg.id + ":" + $existentShiftTemplateCfg.name)
            DPA-ShiftScheduleTemplate-remove $existentShiftTemplateCfg.id > $null
        }
    }

    foreach ($shiftTemplateCfg in $shiftTemplatesCfg) {
        $existentShiftTemplateCfg = $existentTemplatesCfg | where { $_.name -eq $shiftTemplateCfg.name }
        if ($existentShiftTemplateCfg) {
            Write-Host ("Update " + $existentShiftTemplateCfg.id + ":" + $existentShiftTemplateCfg.name)
            $shiftTemplateDto = DPA-ShiftScheduleTemplate-get $existentShiftTemplateCfg.id
            $shiftTemplateDto.name = $shiftTemplateCfg.name
            $shiftTemplateDto.templateType = ($global:shiftTemplateTypeValues | where { $_.enum -eq $shiftTemplateCfg.type }).id
            $shiftTemplateDto.intervals = $shiftTemplateCfg.intervals | foreach { @{
                start = $_.start
                end = $_.end
                shiftId = (ShiftTemplates-GetShift $_.shift).id
            } }
            DPA-ShiftScheduleTemplate-update $shiftTemplateDto > $null
            $shiftTemplateCfg.id = $shiftTemplateDto.id
        } else {
            Write-Host ("Create " + $shiftTemplateCfg.name)
            $shiftTemplateDto = DPA-ShiftScheduleTemplate-get 0
            $shiftTemplateDto.name = $shiftTemplateCfg.name
            $shiftTemplateDto.templateType = ($global:shiftTemplateTypeValues | where { $_.enum -eq $shiftTemplateCfg.type }).id
            $shiftTemplateDto.intervals = $shiftTemplateCfg.intervals | foreach { @{
                start = $_.start
                end = $_.end
                shiftId = (ShiftTemplates-GetShift $_.shift).id
            } }
            DPA-ShiftScheduleTemplate-update $shiftTemplateDto > $null
            $shiftTemplateCfg.id = ((DPA-ShiftScheduleTemplates-getAll) | where { $_.name -eq $shiftTemplateCfg.name }).id
        }
    }
}

function ShiftTemplates-Update()
{
    $global:shiftTemplateTypeValues = DPA-ScheduleTemplateType-getEnumValues

    Write-Host
    Write-Host "shift templates READ CONFIGURATION" -Foreground green
    Write-Host
    $shiftTemplatesCfg = ShiftTemplates-ReadConfiguration

    Write-Host
    Write-Host "shift templates FETCH" -Foreground green
    Write-Host
    $existentTemplatesCfg = ShiftTemplates-Fetch

    Write-Host
    Write-Host "shift templates EXECUTE UPDATE" -Foreground green
    Write-Host
    ShiftTemplates-ExecuteUpdate $shiftTemplatesCfg $existentTemplatesCfg

    $global:shiftTemplates = $shiftTemplatesCfg
}
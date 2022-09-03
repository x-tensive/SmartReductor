$ErrorActionPreference = "Stop"

function ShiftScheduleTemplates-Clear()
{
    $oldTemplates = DPA-ShiftScheduleTemplate-getAll
    foreach ($item in $oldTemplates) {
        if ($item.isSystemScheduleTemplate) {
            # $template = DPA-ShiftScheduleTemplate-get $item.id
            # $template.isUndeletable = $false
            # DPA-ShiftScheduleTemplate-update $template
            continue
        }
        Write-Host "Remove " -NoNewLine -Foreground yellow
        Write-Host "$($item.id):$($item.name)"
        DPA-ShiftScheduleTemplate-remove $item.id
    }
}

function Shifts-Configuration-DumpShifts($shiftsCfg)
{
   foreach ($shiftCfg in $shiftsCfg) {
        $workingTitle = "non working"
        if ($shiftCfg.isWorkingTime) { $workingTitle = "working" }
        Write-Host "$($shiftCfg.name):$($shiftCfg.color):$workingTitle"
    }
}

function Shifts-ReadConfiguration()
{
    $shiftsCfgFileName = $PSScriptRoot + "/../data/shifts.json"
    $shiftsCfg = Get-Content $shiftsCfgFileName | Out-String | ConvertFrom-Json -AsHashtable
    Shifts-Configuration-DumpShifts $shiftsCfg
    return $shiftsCfg;
}

function Shifts-Fetch()
{
    $existentCfg = DPA-Shifts-getAll
    Shifts-Configuration-DumpShifts $existentCfg
    return $existentCfg
}

function Shifts-ExecuteUpdate($shiftsCfg, $existentCfg)
{
    foreach ($existentShiftCfg in $existentCfg) {
        $shiftCfg = $shiftsCfg | where { $_.name -eq $existentShiftCfg.name }
        if (-not $shiftCfg) {
            Write-Host "Remove" -NoNewLine -Foreground yellow
            Write-Host (" " + $existentShiftCfg.id + ":" + $existentShiftCfg.name)
            DPA-Shift-remove $existentShiftCfg.id
        }
    }

    foreach ($shiftCfg in $shiftsCfg) {
        $existentShiftCfg = $existentCfg | where { $_.name -eq $shiftCfg.name }
        if ($existentShiftCfg) {
            Write-Host ("Update " + $existentShiftCfg.id + ":" + $existentShiftCfg.name)
            $shiftDto = DPA-Shift-get $existentShiftCfg.id
            ($shiftDto.fields | where {$_.name -eq "Name"}).value = $shiftCfg.name
            ($shiftDto.fields | where {$_.name -eq "Color"}).value = $shiftCfg.color
            ($shiftDto.fields | where {$_.name -eq "IsWorkingTime"}).value = $shiftCfg.isWorkingTime
            DPA-Shift-update $shiftDto
            $shiftCfg.id = $existentShiftCfg.id
        } else {
            Write-Host ("Create " + $shiftCfg.name)
            $shiftDto = DPA-Shift-get 0
            ($shiftDto.fields | where {$_.name -eq "Name"}).value = $shiftCfg.name
            ($shiftDto.fields | where {$_.name -eq "Color"}).value = $shiftCfg.color
            ($shiftDto.fields | where {$_.name -eq "IsWorkingTime"}).value = $shiftCfg.isWorkingTime
            DPA-Shift-update $shiftDto
            $shiftCfg.id = ((DPA-Shifts-getAll) | where { $_.name -eq $shiftCfg.name }).id
        }
    }
}

function Shifts-Update()
{
    Write-Host
    Write-Host "shifts READ CONFIGURATION" -Foreground green
    Write-Host
    $shiftsCfg = Shifts-ReadConfiguration

    Write-Host
    Write-Host "shifts FETCH" -Foreground green
    Write-Host
    $existentCfg = Shifts-Fetch

    Write-Host
    Write-Host "shifts EXECUTE UPDATE" -Foreground green
    Write-Host
    Shifts-ExecuteUpdate $shiftsCfg $existentCfg

    # Write-Host
    # Write-Host "shift schedule templates CLEAR" -Foreground green
    # Write-Host
    # ShiftScheduleTemplates-Clear
}
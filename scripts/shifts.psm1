$ErrorActionPreference = "Stop"

function Shifts-Configuration-Dump($shiftsCfg)
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
    Shifts-Configuration-Dump $shiftsCfg
    return $shiftsCfg;
}

function Shifts-Fetch()
{
    $existentCfg = DPA-Shifts-getAll
    Shifts-Configuration-Dump $existentCfg
    return $existentCfg
}

function Shifts-ExecuteUpdate($shiftsCfg, $existentCfg)
{
    foreach ($existentShiftCfg in $existentCfg) {
        $shiftCfg = $shiftsCfg | where { $_.name -eq $existentShiftCfg.name }
        if (-not $shiftCfg) {
            Write-Host "Remove" -NoNewLine -Foreground yellow
            Write-Host (" " + $existentShiftCfg.id + ":" + $existentShiftCfg.name)
            DPA-Shift-remove $existentShiftCfg.id > $null
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
            DPA-Shift-update $shiftDto > $null
            $shiftCfg.id = $existentShiftCfg.id
        } else {
            Write-Host ("Create " + $shiftCfg.name)
            $shiftDto = DPA-Shift-get 0
            ($shiftDto.fields | where {$_.name -eq "Name"}).value = $shiftCfg.name
            ($shiftDto.fields | where {$_.name -eq "Color"}).value = $shiftCfg.color
            ($shiftDto.fields | where {$_.name -eq "IsWorkingTime"}).value = $shiftCfg.isWorkingTime
            DPA-Shift-update $shiftDto > $null
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

    $global:shifts = $shiftsCfg
}
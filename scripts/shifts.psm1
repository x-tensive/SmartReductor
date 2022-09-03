$ErrorActionPreference = "Stop"

function ShiftScheduleTemplate-Clear()
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

function Shifts-Update()
{
    Write-Host
    Write-Host "shift schedule templates CLEAR" -Foreground green
    Write-Host
    ShiftScheduleTemplate-Clear
}
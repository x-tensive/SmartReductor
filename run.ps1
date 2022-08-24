Remove-Module -Name "dpa" 2> $null

$ErrorActionPreference = "Stop"

$dpaModule = $PSScriptRoot + "/scripts/dpa.psm1"
Import-Module $dpaModule -DisableNameChecking

DPA-Login "http://dpadev" "admin" "admin"

$dpaHost = DPA-GetHost
Write-Host $dpaHost.name $dpaHost.dpaHostVersion

DPA-Logout

Remove-Module -Name "dpa"
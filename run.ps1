param (
    [string] $url = "http://localhost",
    [string] $userName = "admin",
    [string] $userPassword = "admin"
)

Remove-Module -Name "dpa" 2> $null
Remove-Module -Name "enterpriseStruct" 2> $null
Remove-Module -Name "shifts" 2> $null

$ErrorActionPreference = "Stop"

$dpaModule = $PSScriptRoot + "/scripts/dpa.psm1"
$enterpriseStructModule = $PSScriptRoot + "/scripts/enterpriseStruct.psm1"
$shiftsModule = $PSScriptRoot + "/scripts/shifts.psm1"

Import-Module $dpaModule -DisableNameChecking
Import-Module $enterpriseStructModule -DisableNameChecking
Import-Module $shiftsModule -DisableNameChecking

DPA-Login $url $userName $userPassword
Write-Host $global:dpaHostName $global:dpaHostVersion

EnterpriseStruct-Update
Shifts-Update

DPA-Logout

Remove-Module -Name "dpa"
Remove-Module -Name "enterpriseStruct"
Remove-Module -Name "shifts"
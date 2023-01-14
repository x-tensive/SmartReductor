interface shiftScheduleOwnerCfg
{
    id: number | undefined;
    shiftSchedule: string | undefined;
    shiftScheduleBefore: number | undefined;
    shiftScheduleAfter: number | undefined;
}

interface availableReasonsOwnerCfg
{
    id: number | undefined;
    availableDowntimeReasons: "all" | "inherit" | string[] | undefined;
    availableOperationRunSuspendReasons: "all" |"inherit" |  string[] | undefined;
    availableOvertimeReasons: "all" |"inherit" |  string[] | undefined;
    availableUnderproductionReasons: "all" |"inherit" |  string[] | undefined;
}

interface workCenterCfg extends shiftScheduleOwnerCfg, availableReasonsOwnerCfg
{
    id: number | undefined;
    name: string;
    model: string | undefined;
    inventoryNumber: string | undefined;
    description: string | undefined;
    groups: string[] | undefined;
    counterType: "CP" | "counter" | "none" | undefined;
    counterIncrementType: "diff" | "change" | undefined;
    counterDiscreteness: number | undefined;
    normativeDiscreteness: number | undefined;
    qualityMark: "conditionalGood" | "good" | "bad" | undefined;
    masterMustComfirmIncompleteJobClose: boolean | undefined;
    masterMustComfirmDisorderJobStar: boolean | undefined;
    allowMultipleJobsRun: boolean | undefined;
    forbidJobStartWhenAnotherJobIsSuspended: boolean | undefined;
    allowMultiplePersonalShifts: boolean | undefined;
    useMachineStatisticsOutput: boolean | undefined;
    parseCP: "name" | "tags" | "none" | undefined;
    parseCPsystemName: "disabled" | "fanuc1" | "fanuc2" | undefined;
}

interface storageZoneCfg
{
    id: number | undefined;
    name: string;
    address: string;
}

interface departmentCfg extends shiftScheduleOwnerCfg, availableReasonsOwnerCfg
{
    id: number | undefined;
    name: string;
    departments: departmentCfg[] | undefined;
    workCenters: workCenterCfg[] | undefined;
    storageZones: storageZoneCfg[] | undefined;
}

interface siteCfg extends shiftScheduleOwnerCfg, availableReasonsOwnerCfg
{
    id: number | undefined;
    name: string;
    departments: departmentCfg[] | undefined;
}

interface enterpriseCfg extends shiftScheduleOwnerCfg, availableReasonsOwnerCfg
{
    id: number | undefined;
    name: string;
    sites: siteCfg[] | undefined;
}

interface workCenterGroupCfg
{
    id: number | undefined;
    name: string;
}

interface shiftCfg
{
    id: number | undefined;
    name: string;
    color: string | undefined;
    isWorkingTime: boolean | undefined;
}

interface shiftTemplateIntervalCfg
{
    start: string;
    end: string;
    shift: string;
}

interface shiftTemplateCfg
{
    id: number | undefined;
    name: string;
    type: "Week" | "Day";
    intervals: shiftTemplateIntervalCfg[];
}

interface downtimeReasonTypeCfg
{
    id: number | undefined;
    name: string;
}

interface downtimeReasonCfg
{
    id: number | undefined;
    name: string;
    color: string;
    reasonCategory: string | undefined;
    reasonType: string;
    allowSetInAnalytics: boolean | undefined;
    allowSetInOperator: boolean | undefined;
    isImportant: boolean | undefined;
    sortOrder: number | undefined;
}

interface operationRunSuspendReasonCfg
{
    id: number | undefined;
    code: string | undefined;
    name: string;
    color: string;
    isAdditionalTime: boolean | undefined;
    sortOrder: number | undefined;
}

interface overtimeReasonCfg
{
    id: number | undefined;
    code: string | undefined;
    name: string;
    color: string;
    isAdditionalTime: boolean | undefined;
    sortOrder: number | undefined;
}

interface underproductionReasonCfg
{
    id: number | undefined;
    name: string;
    color: string;
    sortOrder: number | undefined;
}

interface settingCfg
{
    sid: string | undefined;
    type: number | undefined;
    name: string;
    value: any;
}

interface settingGroupCfg
{
    name: string;
    groups: settingGroupCfg[] | undefined;
    settings: settingCfg[] | undefined;
}
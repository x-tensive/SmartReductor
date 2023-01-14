import fs from "fs";

export class smartReductorConfig
{
    public static readEnterpriseStructConfig(): enterpriseCfg
    {
        const buffer = fs.readFileSync("./data/enterpriseStruct.json");
        return JSON.parse(buffer.toString());
    }

    public static readShiftsConfiguration(): shiftCfg[]
    {
        const buffer = fs.readFileSync("./data/shifts.json");
        return JSON.parse(buffer.toString());
    }

    public static readShiftTemplatesConfiguration(): shiftTemplateCfg[]
    {
        const buffer = fs.readFileSync("./data/shiftTemplates.json");
        return JSON.parse(buffer.toString());
    }

    public static readDowntimeReasonTypesConfiguration(): downtimeReasonTypeCfg[]
    {
        const buffer = fs.readFileSync("./data/downtimeReasonTypes.json");
        return JSON.parse(buffer.toString());
    }

    public static readDowntimeReasonsConfiguration(): downtimeReasonCfg[]
    {
        const buffer = fs.readFileSync("./data/downtimeReasons.json");
        return JSON.parse(buffer.toString());
    }

    public static readOperationRunSuspendReasonsConfiguration(): operationRunSuspendReasonCfg[]
    {
        const buffer = fs.readFileSync("./data/operationRunSuspendReasons.json");
        return JSON.parse(buffer.toString());
    }

    public static readOvertimeReasonsConfiguration(): overtimeReasonCfg[]
    {
        const buffer = fs.readFileSync("./data/overtimeReasons.json");
        return JSON.parse(buffer.toString());
    }

    public static readUnderproductionReasonsConfiguration(): underproductionReasonCfg[]
    {
        const buffer = fs.readFileSync("./data/underproductionReasons.json");
        return JSON.parse(buffer.toString());
    }

    public static readSettingsConfiguration(): settingGroupCfg[]
    {
        const buffer = fs.readFileSync("./data/settings.json");
        return JSON.parse(buffer.toString());
    }

    public static readWorkCenterGroupsConfiguration(): workCenterGroupCfg[]
    {
        const buffer = fs.readFileSync("./data/workCenterGroups.json");
        return JSON.parse(buffer.toString());
    }
}
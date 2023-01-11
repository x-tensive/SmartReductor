import fs from "fs";

export class smartReductorConfig
{
    public static readEnterpriseStructConfig(): any
    {
        const buffer = fs.readFileSync("./data/enterpriseStruct.json");
        return JSON.parse(buffer.toString());
    }

    public static readShiftsConfiguration(): any
    {
        const buffer = fs.readFileSync("./data/shifts.json");
        return JSON.parse(buffer.toString());
    }

    public static readShiftTemplatesConfiguration(): any
    {
        const buffer = fs.readFileSync("./data/shiftTemplates.json");
        return JSON.parse(buffer.toString());
    }

    public static readDowntimeReasonTypesConfiguration(): any
    {
        const buffer = fs.readFileSync("./data/downtimeReasonTypes.json");
        return JSON.parse(buffer.toString());
    }

    public static readDowntimeReasonsConfiguration(): any
    {
        const buffer = fs.readFileSync("./data/downtimeReasons.json");
        return JSON.parse(buffer.toString());
    }

    public static readOperationRunSuspendReasonsConfiguration(): any
    {
        const buffer = fs.readFileSync("./data/operationRunSuspendReasons.json");
        return JSON.parse(buffer.toString());
    }

    public static readOvertimeReasonsConfiguration(): any
    {
        const buffer = fs.readFileSync("./data/overtimeReasons.json");
        return JSON.parse(buffer.toString());
    }

    public static readUnderproductionReasonsConfiguration(): any
    {
        const buffer = fs.readFileSync("./data/underproductionReasons.json");
        return JSON.parse(buffer.toString());
    }

    public static readSettingsConfiguration(): any
    {
        const buffer = fs.readFileSync("./data/settings.json");
        return JSON.parse(buffer.toString());
    }

    public static readWorkCenterGroupsConfiguration(): any
    {
        const buffer = fs.readFileSync("./data/workCenterGroups.json");
        return JSON.parse(buffer.toString());
    }
}
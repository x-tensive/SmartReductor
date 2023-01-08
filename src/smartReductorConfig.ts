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
}
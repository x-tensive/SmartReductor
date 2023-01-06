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
}
import fs from "fs";

export class smartReductorConfig
{
    public static readEnterpriseStructConfig(): any
    {
        const buffer = fs.readFileSync("./data/enterpriseStruct.json");
        return JSON.parse(buffer.toString());
    }
}
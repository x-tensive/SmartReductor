import { dpa } from "../dpa";

export class compareDowntimeReasonTypes
{
    public static generateUpdateActions(typesCfg: downtimeReasonTypeCfg[], existentCfg: any[]): any[]
    {
        let actions: any[] = [];

        for (const existentTypeCfg of existentCfg) {
            const typeCfg = typesCfg.find((item: any) => item.name == existentTypeCfg.name);
            if (!typeCfg) {
                actions.push({
                    actionName: "RemoveDowntimeReasonType",
                    id: existentTypeCfg.id,
                    name: existentTypeCfg.name,
                    execute: async (client: dpa, action: any) => {
                        await client.referenceBook_removeDowntimeReasonType(action.id);
                    }
                });
            }
        }
    
        for (const typeCfg of typesCfg) {
            const existentTypeCfg = existentCfg.find((item: any) => item.name == typeCfg.name);
            if (existentTypeCfg) {
                typeCfg.id = existentTypeCfg.id;
            } else {
                actions.push({
                    actionName: "CreateDowntimeReasonType",
                    cfg: typeCfg,
                    execute: async (client: dpa, action: any) => {
                        const typeId = await client.referenceBook_createDowntimeReasonType(action.cfg.name);
                        action.cfg.id = typeId;
                    }
                });
            }
        }
        
        return actions;
    }
}
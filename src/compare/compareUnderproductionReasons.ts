import { dpa } from "../dpa";

export class compareUnderproductionReasons
{
    public static generateUpdateActions(reasonsCfg: any, existentCfg: any[]): any[]
    {
        let actions: any[] = [];

        for (const existentReasonCfg of existentCfg) {
            const reasonCfg = reasonsCfg.find((item: any) => item.name == existentReasonCfg.name);
            if (!reasonCfg) {
                actions.push({
                    actionName: "RemoveUnderproductionReason",
                    id: existentReasonCfg.id,
                    name: existentReasonCfg.name,
                    execute: async (client: dpa, action: any) => {
                        await client.referenceBook_removeUnderproductionReason(action.id);
                    }
                });
            }
        }

        const sortOrder = (cfg: any): number => cfg.sortOrder ?? false;
    
        for (const reasonCfg of reasonsCfg) {
            const existentReasonCfg = existentCfg.find((item: any) => item.name == reasonCfg.name);
            if (existentReasonCfg) {
                reasonCfg.id = existentReasonCfg.id;
                const isChanged = 
                    existentReasonCfg.name != reasonCfg.name ||
                    existentReasonCfg.color != reasonCfg.color ||
                    existentReasonCfg.sortOrder != sortOrder(reasonCfg);
                if (isChanged) {
                    actions.push({
                        actionName: "UpdateUnderproductionReason",
                        id: existentReasonCfg.id,
                        cfg: reasonCfg,
                        execute: async (client: dpa, action: any) => {
                            await client.referenceBook_updateUnderproductionReason(
                                action.id,
                                action.cfg.name,
                                action.cfg.color,
                                sortOrder(action.cfg));
                        }
                    });
                }
            } else {
                actions.push({
                    actionName: "CreateUnderproductionReason",
                    cfg: reasonCfg,
                    execute: async (client: dpa, action: any) => {
                        const reasonId = await client.referenceBook_createUnderproductionReason(
                            action.cfg.name,
                            action.cfg.color,
                            sortOrder(action.cfg));
                        action.cfg.id = reasonId;
                    }
                });
            }
        }
        
        return actions;
    }
}
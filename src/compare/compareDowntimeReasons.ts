import { dpa } from "../dpa";

export class compareDowntimeReasons
{
    public static generateUpdateActions(typesCfg: any, reasonsCfg: any, existentCfg: any[]): any[]
    {
        let actions: any[] = [];

        for (const existentReasonCfg of existentCfg) {
            const reasonCfg = reasonsCfg.find((item: any) => item.name == existentReasonCfg.name);
            if (!reasonCfg) {
                actions.push({
                    actionName: "RemoveDowntimeReason",
                    id: existentReasonCfg.id,
                    name: existentReasonCfg.name,
                    execute: async (client: dpa, action: any) => {
                        await client.referenceBook_removeDowntimeReason(action.id);
                    }
                });
            }
        }

        const allowSetInAnalytics = (cfg: any): boolean => cfg.allowSetInAnalytics ?? false;
        const allowSetInOperator = (cfg: any): boolean => cfg.allowSetInOperator ?? false;
        const isImportant = (cfg: any): boolean => cfg.isImportant ?? false;
        const sortOrder = (cfg: any): number => cfg.sortOrder ?? false;
    
        for (const reasonCfg of reasonsCfg) {
            const existentReasonCfg = existentCfg.find((item: any) => item.name == reasonCfg.name);
            if (existentReasonCfg) {
                reasonCfg.id = existentReasonCfg.id;
            } else {
                actions.push({
                    actionName: "CreateDowntimeReason",
                    cfg: reasonCfg,
                    execute: async (client: dpa, action: any) => {
                        const reasonId = await client.referenceBook_createDowntimeReason(
                            action.cfg.name,
                            action.cfg.color,
                            action.cfg.reasonCategory,
                            action.cfg.reasonType,
                            allowSetInAnalytics(action.cfg),
                            allowSetInOperator(action.cfg),
                            isImportant(action.cfg),
                            sortOrder(action.cfg));
                        action.cfg.id = reasonId;
                    }
                });
            }
        }
        
        return actions;
    }
}
import { dpa } from "../dpa";

export class compareDowntimeReasons
{
    public static async generateUpdateActions(client: dpa, typesCfg: any, reasonsCfg: any, existentCfg: any[]): Promise<any[]>
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

        const categories = await client.getDowntimeCategories();

        const downtimeCategory = (cfg: any): number => categories.byEnum(cfg.reasonCategory ?? "Undefined")!.id;
        const reasonType = (cfg: any): number => typesCfg.find((item: any) => item.name == cfg.reasonType)!.id;
        const allowSetInAnalytics = (cfg: any): boolean => cfg.allowSetInAnalytics ?? false;
        const allowSetInOperator = (cfg: any): boolean => cfg.allowSetInOperator ?? false;
        const isImportant = (cfg: any): boolean => cfg.isImportant ?? false;
        const sortOrder = (cfg: any): number => cfg.sortOrder ?? false;
    
        for (const reasonCfg of reasonsCfg) {
            const existentReasonCfg = existentCfg.find((item: any) => item.name == reasonCfg.name);
            if (existentReasonCfg) {
                reasonCfg.id = existentReasonCfg.id;
                const isChanged = 
                    existentReasonCfg.name != reasonCfg.name ||
                    existentReasonCfg.color != reasonCfg.color ||
                    existentReasonCfg.reasonCategory != downtimeCategory(reasonCfg) ||
                    existentReasonCfg.reasonType != reasonCfg.reasonType ||
                    existentReasonCfg.allowSetInAnalytics != allowSetInAnalytics(reasonCfg) ||
                    existentReasonCfg.allowSetInOperator != allowSetInOperator(reasonCfg) ||
                    existentReasonCfg.isImportant != isImportant(reasonCfg) ||
                    existentReasonCfg.sortOrder != sortOrder(reasonCfg);
                if (isChanged) {
                    actions.push({
                        actionName: "UpdateDowntimeReason",
                        id: existentReasonCfg.id,
                        cfg: reasonCfg,
                        execute: async (client: dpa, action: any) => {
                            await client.referenceBook_updateDowntimeReason(
                                action.id,
                                action.cfg.name,
                                action.cfg.color,
                                downtimeCategory(action.cfg),
                                reasonType(action.cfg),
                                allowSetInAnalytics(action.cfg),
                                allowSetInOperator(action.cfg),
                                isImportant(action.cfg),
                                sortOrder(action.cfg));
                        }
                    });
                }
            } else {
                actions.push({
                    actionName: "CreateDowntimeReason",
                    cfg: reasonCfg,
                    execute: async (client: dpa, action: any) => {
                        const reasonId = await client.referenceBook_createDowntimeReason(
                            action.cfg.name,
                            action.cfg.color,
                            downtimeCategory(action.cfg),
                            reasonType(action.cfg),
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
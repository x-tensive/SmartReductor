import { dpa } from "../dpa";

export class compareOvertimeReasons
{
    public static generateUpdateActions(reasonsCfg: overtimeReasonCfg[], existentCfg: any[]): any[]
    {
        let actions: any[] = [];

        for (const existentReasonCfg of existentCfg) {
            const reasonCfg = reasonsCfg.find((item: any) => item.name == existentReasonCfg.name);
            if (!reasonCfg) {
                actions.push({
                    actionName: "RemoveOvertimeReason",
                    id: existentReasonCfg.id,
                    name: existentReasonCfg.name,
                    execute: async (client: dpa, action: any) => {
                        await client.referenceBook_removeOvertimeReason(action.id);
                    }
                });
            }
        }

        const isAdditionalTime = (cfg: overtimeReasonCfg): boolean => cfg.isAdditionalTime ?? false;
        const sortOrder = (cfg: overtimeReasonCfg): number => cfg.sortOrder ?? 0;
    
        for (const reasonCfg of reasonsCfg) {
            const existentReasonCfg = existentCfg.find((item: any) => item.name == reasonCfg.name);
            if (existentReasonCfg) {
                reasonCfg.id = existentReasonCfg.id;
                const isChanged = 
                    existentReasonCfg.code != reasonCfg.code ||
                    existentReasonCfg.name != reasonCfg.name ||
                    existentReasonCfg.color != reasonCfg.color ||
                    existentReasonCfg.isAdditionalTime != isAdditionalTime(reasonCfg) ||
                    existentReasonCfg.sortOrder != sortOrder(reasonCfg);
                if (isChanged) {
                    actions.push({
                        actionName: "UpdateOvertimeReason",
                        id: existentReasonCfg.id,
                        cfg: reasonCfg,
                        execute: async (client: dpa, action: any) => {
                            await client.referenceBook_updateOvertimeReason(
                                action.id,
                                action.cfg.code,
                                action.cfg.name,
                                action.cfg.color,
                                isAdditionalTime(action.cfg),
                                sortOrder(action.cfg));
                        }
                    });
                }
            } else {
                actions.push({
                    actionName: "CreateOvertimeReason",
                    cfg: reasonCfg,
                    execute: async (client: dpa, action: any) => {
                        const reasonId = await client.referenceBook_createOvertimeReason(
                            action.cfg.code,
                            action.cfg.name,
                            action.cfg.color,
                            isAdditionalTime(action.cfg),
                            sortOrder(action.cfg));
                        action.cfg.id = reasonId;
                    }
                });
            }
        }
        
        return actions;
    }
}
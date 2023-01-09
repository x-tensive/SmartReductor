import { dpa } from "../dpa";

export class compareOperationRunSuspendReasons
{
    public static generateUpdateActions(reasonsCfg: any, existentCfg: any[]): any[]
    {
        let actions: any[] = [];

        for (const existentReasonCfg of existentCfg) {
            const reasonCfg = reasonsCfg.find((item: any) => item.name == existentReasonCfg.name);
            if (!reasonCfg) {
                actions.push({
                    actionName: "RemoveOperationRunSuspendReason",
                    id: existentReasonCfg.id,
                    name: existentReasonCfg.name,
                    execute: async (client: dpa, action: any) => {
                        await client.referenceBook_removeOperationRunSuspendReason(action.id);
                    }
                });
            }
        }

        const isAdditionalTime = (cfg: any): boolean => cfg.isImportant ?? false;
        const sortOrder = (cfg: any): number => cfg.sortOrder ?? false;
    
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
                        actionName: "UpdateOperationRunSuspendReason",
                        id: existentReasonCfg.id,
                        cfg: reasonCfg,
                        execute: async (client: dpa, action: any) => {
                            await client.referenceBook_updateOperationRunSuspendReason(
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
                    actionName: "CreateOperationRunSuspendReason",
                    cfg: reasonCfg,
                    execute: async (client: dpa, action: any) => {
                        const reasonId = await client.referenceBook_createOperationRunSuspendReason(
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
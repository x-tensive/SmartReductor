import { dpa } from "../dpa";

export class compareWorkCenterGroups
{
    public static generateUpdateActions(groupsCfg: workCenterGroupCfg[], existentCfg: any[]): any[]
    {
        let actions: any[] = [];

        for (const existentGroupCfg of existentCfg) {
            const groupCfg = groupsCfg.find((item: any) => item.name == existentGroupCfg.name);
            if (!groupCfg) {
                actions.push({
                    actionName: "RemoveWorkCenterGroup",
                    id: existentGroupCfg.id,
                    name: existentGroupCfg.name,
                    execute: async (client: dpa, action: any) => {
                        await client.referenceBook_removeWorkCenterGroup(action.id);
                    }
                });
            }
        }
    
        for (const groupCfg of groupsCfg) {
            const existentGroupCfg = existentCfg.find((item: any) => item.name == groupCfg.name);
            if (existentGroupCfg) {
                groupCfg.id = existentGroupCfg.id;
            } else {
                actions.push({
                    actionName: "CreateWorkCenterGroup",
                    cfg: groupCfg,
                    execute: async (client: dpa, action: any) => {
                        const groupId = await client.referenceBook_createWorkCenterGroup(action.cfg.name);
                        action.cfg.id = groupId;
                    }
                });
            }
        }
        
        return actions;
    }
}
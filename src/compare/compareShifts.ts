import { dpa } from "../dpa";

export class compareShifts
{
    public static generateUpdateActions(shiftsCfg: shiftCfg[], existentCfg: any[]): any[]
    {
        let actions: any[] = [];

        for (const existentShiftCfg of existentCfg) {
            const shiftCfg = shiftsCfg.find((item: any) => item.name == existentShiftCfg.name);
            if (!shiftCfg) {
                actions.push({
                    actionName: "RemoveShift",
                    id: existentShiftCfg.id,
                    name: existentShiftCfg.name,
                    execute: async (client: dpa, action: any) => {
                        await client.referenceBook_removeShift(action.id);
                    }
                });
            }
        }
    
        for (const shiftCfg of shiftsCfg) {
            const existentShiftCfg = existentCfg.find((item: any) => item.name == shiftCfg.name);
            if (existentShiftCfg) {
                shiftCfg.id = existentShiftCfg.id;
                const isChanged = 
                    existentShiftCfg.name != shiftCfg.name ||
                    existentShiftCfg.color != shiftCfg.color ||
                    existentShiftCfg.isWorkingTime != shiftCfg.isWorkingTime;
                if (isChanged) {
                    actions.push({
                        actionName: "UpdateShift",
                        id: existentShiftCfg.id,
                        cfg: shiftCfg,
                        execute: async (client: dpa, action: any) => {
                            await client.referenceBook_updateShift(action.id, action.cfg.name, action.cfg.color, action.cfg.isWorkingTime);
                        }
                    });
                }
            } else {
                actions.push({
                    actionName: "CreateShift",
                    cfg: shiftCfg,
                    execute: async (client: dpa, action: any) => {
                        const shiftId = await client.referenceBook_createShift(action.cfg.name, action.cfg.color, action.cfg.isWorkingTime);
                        action.cfg.id = shiftId;
                    }
                });
            }
        }
        
        return actions;
    }
}
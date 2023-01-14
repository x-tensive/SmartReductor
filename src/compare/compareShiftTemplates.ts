import { dpa } from "../dpa";

export class compareShiftTemplates
{
    private static getIntervals(shiftsCfg: shiftCfg[], intervalsCfg: any[]): any[]
    {
        return intervalsCfg.map((cfg) => ({
            start: cfg.start,
            end: cfg.end,
            shiftId: shiftsCfg.find((shiftCfg) => shiftCfg.name == cfg.shift)!.id
        }));
    }

    private static cmpIntervalItems(item1: any, item2: any): boolean
    {
        if (item1.start != item2.start) return false;
        if (item1.end != item2.end) return false;
        if (item1.shiftId != item2.shiftId) return false;
        return true;
    }

    private static cmpIntervals(int1: any[], int2: any[]): boolean
    {
        for (const item1 of int1) {
            const item2 = int2.find((item) => this.cmpIntervalItems(item1, item));
            if (!item2)
                return false;
        }

        for (const item2 of int2) {
            const item1 = int1.find((item) => this.cmpIntervalItems(item2, item));
            if (!item1)
                return false;
        }

        return true;
    }

    public static async generateUpdateActions(client: dpa, shiftsCfg: shiftCfg[], shiftTemplatesCfg: shiftTemplateCfg[], existentCfg: any[]): Promise<any[]>
    {
        let actions: any[] = [];

        for (const existentShiftTemplateCfg of existentCfg) {
            const shiftTemplateCfg = shiftTemplatesCfg.find((item: any) => item.name == existentShiftTemplateCfg.name);
            if (!shiftTemplateCfg) {
                actions.push({
                    actionName: "RemoveShiftTemplate",
                    id: existentShiftTemplateCfg.id,
                    name: existentShiftTemplateCfg.name,
                    execute: async (client: dpa, action: any) => {
                        await client.referenceBook_removeShiftTemplate(action.id);
                    }
                });
            }
        }

        const shiftTempateTypes = await client.getShiftTemplateTypes();

        for (const shiftTemplateCfg of shiftTemplatesCfg) {
            const intervals = this.getIntervals(shiftsCfg, shiftTemplateCfg.intervals);
            const existentShiftTemplateCfg = existentCfg.find((item: any) => item.name == shiftTemplateCfg.name);
            if (existentShiftTemplateCfg) {
                shiftTemplateCfg.id = existentShiftTemplateCfg.id;
                const isChanged = 
                    existentShiftTemplateCfg.name != shiftTemplateCfg.name ||
                    existentShiftTemplateCfg.templateType != shiftTempateTypes.byEnum(shiftTemplateCfg.type)!.id ||
                    !this.cmpIntervals(existentShiftTemplateCfg.intervals, intervals);
                if (isChanged) {
                    actions.push({
                        actionName: "UpdateShiftTemplate",
                        id: existentShiftTemplateCfg.id,
                        cfg: shiftTemplateCfg,
                        intervals: intervals,
                        execute: async (client: dpa, action: any) => {
                            await client.referenceBook_updateShiftTemplate(action.id, action.cfg.name, action.cfg.type, action.intervals);
                        }
                    });
                }
            } else {
                actions.push({
                    actionName: "CreateShiftTemplate",
                    cfg: shiftTemplateCfg,
                    intervals: intervals,
                    execute: async (client: dpa, action: any) => {
                        const shiftTemplateId = await client.referenceBook_createShiftTemplate(action.cfg.name, action.cfg.type, action.intervals);
                        action.cfg.id = shiftTemplateId;
                    }
                });
            }
        }

        return actions;
    }
}
import { dpa } from "../dpa";

export class compareShiftTemplates
{
    public static async generateUpdateActions(client: dpa, shiftTemplatesCfg: any, existentCfg: any[]): Promise<any[]>
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
            const existentShiftTemplateCfg = existentCfg.find((item: any) => item.name == shiftTemplateCfg.name);
            if (existentShiftTemplateCfg) {
                shiftTemplateCfg.id = existentShiftTemplateCfg.id;
                const isChanged = 
                    existentShiftTemplateCfg.name != shiftTemplateCfg.name ||
                    existentShiftTemplateCfg.templateType != shiftTempateTypes.byEnum(shiftTemplateCfg.type);
                if (isChanged) {
                    actions.push({
                        actionName: "UpdateShiftTemplate",
                        id: existentShiftTemplateCfg.id,
                        cfg: shiftTemplateCfg,
                        execute: async (client: dpa, action: any) => {
                            await client.referenceBook_updateShiftTemplate(action.id, action.cfg.name, action.cfg.type);
                        }
                    });
                }
            } else {
                actions.push({
                    actionName: "CreateShiftTemplate",
                    cfg: shiftTemplateCfg,
                    execute: async (client: dpa, action: any) => {
                        const shiftTemplateId = await client.referenceBook_createShiftTemplate(action.cfg.name, action.cfg.type);
                        action.cfg.id = shiftTemplateId;
                    }
                });
            }
        }

        return actions;
    }
}
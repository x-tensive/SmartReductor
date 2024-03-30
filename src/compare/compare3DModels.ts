import { dpa } from "../dpa";

export class compare3DModels
{
    public static generateUpdateActions(modelsCfg: threeDimensionalModelCfg[], existentCfg: any[]): any[]
    {
        let actions: any[] = [];

        for (const existentModelCfg of existentCfg) {
            const modelCfg = modelsCfg.find((item: any) => item.name == existentModelCfg.name && item.fileName == existentModelCfg.fileName && item.data == existentModelCfg.data);
            if (!modelCfg) {
                actions.push({
                    actionName: "Remove3DModel",
                    id: existentModelCfg.id,
                    name: existentModelCfg.name,
                    execute: async (client: dpa, action: any) => {
                        await client.threeDimensionalModel_delete(action.id);
                    }
                });
            }
        }
    
        for (const modelCfg of modelsCfg) {
            const existentModelCfg = existentCfg.find((item: any) => item.name == modelCfg.name && item.fileName == modelCfg.fileName && item.data == modelCfg.data);
            if (existentModelCfg) {
                modelCfg.id = existentModelCfg.id;
            } else {
                actions.push({
                    actionName: "Create3DModel",
                    cfg: modelCfg,
                    execute: async (client: dpa, action: any) => {
                        const model = await client.threeDimensionalModel_create(action.cfg.name, action.cfg.description, action.cfg.fileName, action.cfg.data, action.cfg.corrections);
                        action.cfg.id = model.id;
                    }
                });
            }
        }
        
        return actions;
    }
}
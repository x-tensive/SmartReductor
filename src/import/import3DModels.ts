import { compare3DModels } from "../compare/compare3DModels.js";
import { dpa } from "../dpa.js";
import { threeDimensionalModels } from "../extract/3DModels.js";
import { smartReductorConfig } from "../smartReductorConfig.js";
import { importBase } from "./importBase.js";
import { importEnterpriseStruct } from "./importEnterpriseStruct.js";

export class import3DModels extends importBase
{
    static async prepareCfg(client: dpa): Promise<{ modelsCfg: threeDimensionalModelCfg[], updateActions: any[] }>
    {
        console.log("3D models READ CONFIGURATION");
        const modelsCfg = smartReductorConfig.read3DModelsConfiguration();

        console.log("3D models FETCH");
        const existentCfg = await threeDimensionalModels.fetch(client);

        console.log("3D models UPDATE ACTIONS");
        const updateActions = compare3DModels.generateUpdateActions(modelsCfg, existentCfg);

        return { modelsCfg: modelsCfg, updateActions: updateActions };
    }

    static async run(client: dpa): Promise<void>
    {
        const cfg = await this.prepareCfg(client);
        this.dumpUpdateActions(cfg.updateActions);

        console.log("3D models EXECUTE UPDATE ACTIONS");
        await this.executeUpdateActions(client, cfg.updateActions);
    }
}
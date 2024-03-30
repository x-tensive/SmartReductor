import { compare3DModelsAttachments } from "../compare/compare3DModelsAttachments.js";
import { dpa } from "../dpa.js";
import { threeDimensionalModels } from "../extract/3DModels.js";
import { smartReductorConfig } from "../smartReductorConfig.js";
import { importBase } from "./importBase.js";
import { import3DModels } from "./import3DModels.js";
import { importEnterpriseStruct } from "./importEnterpriseStruct.js";

export class import3DModelsAttachments extends importBase
{
    static async prepareCfg(client: dpa, enterpriseCfg: enterpriseCfg, modelsCfg: threeDimensionalModelCfg[]): Promise<{ updateActions: any[] }>
    {
        console.log("attach 3D models UPDATE ACTIONS");
        const updateActions = await compare3DModelsAttachments.generateUpdateActions(enterpriseCfg, modelsCfg);

        return { updateActions: updateActions };
    }

    static async run(client: dpa): Promise<void>
    {
        const modelsCfg = await import3DModels.prepareCfg(client);
        if (modelsCfg.updateActions.length)
            throw "3D models update required!";

        const enterpriseStructCfg = await importEnterpriseStruct.prepareCfg(client);
        if (enterpriseStructCfg.updateActions.length)
            throw "enterprise struct update required!";

        const cfg = await this.prepareCfg(client, enterpriseStructCfg.enterpriseCfg, modelsCfg.modelsCfg);
        this.dumpUpdateActions(cfg.updateActions);

        console.log("attach 3D models EXECUTE UPDATE ACTIONS");
        await this.executeUpdateActions(client, cfg.updateActions);
    }
}
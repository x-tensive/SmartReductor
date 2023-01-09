import { compareUnderproductionReasons } from "../compare/compareUnderproductionReasons.js";
import { dpa } from "../dpa.js";
import { underproductionReasons } from "../extract/underproductionReasons.js";
import { smartReductorConfig } from "../smartReductorConfig.js";
import { importBase } from "./importBase.js";

export class importUnderproductionReasons extends importBase
{
    static async prepareCfg(client: dpa): Promise<{ reasonsCfg: any, updateActions: any[] }>
    {
        console.log("underproduction reasons READ CONFIGURATION");
        const reasonsCfg = smartReductorConfig.readUnderproductionReasonsConfiguration();

        console.log("underproduction reasons FETCH");
        const existentCfg = await underproductionReasons.fetch(client);

        console.log("underproduction reasons UPDATE ACTIONS");
        const updateActions = compareUnderproductionReasons.generateUpdateActions(reasonsCfg, existentCfg);

        return { reasonsCfg: reasonsCfg, updateActions: updateActions };
    }

    static async run(client: dpa): Promise<void>
    {
        const cfg = await this.prepareCfg(client);
        this.dumpUpdateActions(cfg.updateActions);

        console.log("underproduction reasons EXECUTE UPDATE ACTIONS");
        await this.executeUpdateActions(client, cfg.updateActions);
    }
}
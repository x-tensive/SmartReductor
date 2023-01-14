import { compareOvertimeReasons } from "../compare/compareOvertimeReasons.js";
import { dpa } from "../dpa.js";
import { overtimeReasons } from "../extract/overtimeReasons.js";
import { smartReductorConfig } from "../smartReductorConfig.js";
import { importBase } from "./importBase.js";

export class importOvertimeReasons extends importBase
{
    static async prepareCfg(client: dpa): Promise<{ reasonsCfg: overtimeReasonCfg[], updateActions: any[] }>
    {
        console.log("overtime reasons READ CONFIGURATION");
        const reasonsCfg = smartReductorConfig.readOvertimeReasonsConfiguration();

        console.log("overtime reasons FETCH");
        const existentCfg = await overtimeReasons.fetch(client);

        console.log("overtime reasons UPDATE ACTIONS");
        const updateActions = compareOvertimeReasons.generateUpdateActions(reasonsCfg, existentCfg);

        return { reasonsCfg: reasonsCfg, updateActions: updateActions };
    }

    static async run(client: dpa): Promise<void>
    {
        const cfg = await this.prepareCfg(client);
        this.dumpUpdateActions(cfg.updateActions);

        console.log("overtime reasons EXECUTE UPDATE ACTIONS");
        await this.executeUpdateActions(client, cfg.updateActions);
    }
}
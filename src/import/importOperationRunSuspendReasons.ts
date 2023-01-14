import { compareOperationRunSuspendReasons } from "../compare/compareOperationRunSuspendReasons.js";
import { dpa } from "../dpa.js";
import { operationRunSuspendReasons } from "../extract/operationRunSuspendReasons.js";
import { smartReductorConfig } from "../smartReductorConfig.js";
import { importBase } from "./importBase.js";

export class importOperationRunSuspendReasons extends importBase
{
    static async prepareCfg(client: dpa): Promise<{ reasonsCfg: operationRunSuspendReasonCfg[], updateActions: any[] }>
    {
        console.log("operation run/suspend reasons READ CONFIGURATION");
        const reasonsCfg = smartReductorConfig.readOperationRunSuspendReasonsConfiguration();

        console.log("operation run/suspend reasons FETCH");
        const existentCfg = await operationRunSuspendReasons.fetch(client);

        console.log("operation run/suspend reasons UPDATE ACTIONS");
        const updateActions = compareOperationRunSuspendReasons.generateUpdateActions(reasonsCfg, existentCfg);

        return { reasonsCfg: reasonsCfg, updateActions: updateActions };
    }

    static async run(client: dpa): Promise<void>
    {
        const cfg = await this.prepareCfg(client);
        this.dumpUpdateActions(cfg.updateActions);

        console.log("operation run/suspend reasons EXECUTE UPDATE ACTIONS");
        await this.executeUpdateActions(client, cfg.updateActions);
    }
}
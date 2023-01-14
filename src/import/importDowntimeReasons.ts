import { compareDowntimeReasons } from "../compare/compareDowntimeReasons.js";
import { compareDowntimeReasonTypes } from "../compare/compareDowntimeReasonTypes.js";
import { dpa } from "../dpa.js";
import { downtimeReasons } from "../extract/downtimeReasons.js";
import { downtimeReasonTypes } from "../extract/downtimeReasonTypes.js";
import { smartReductorConfig } from "../smartReductorConfig.js";
import { importBase } from "./importBase.js";

export class importDowntimeReasons extends importBase
{
    static async prepareCfg(client: dpa): Promise<{ typesCfg: downtimeReasonTypeCfg[], reasonsCfg: downtimeReasonCfg[], updateActions: any[] }>
    {
        console.log("downtime reason types READ CONFIGURATION");
        const typesCfg = smartReductorConfig.readDowntimeReasonTypesConfiguration();

        console.log("downtime reason types FETCH");
        const existentTypesCfg = await downtimeReasonTypes.fetch(client);

        console.log("downtime reason types UPDATE ACTIONS");
        const typesUpdateActions = compareDowntimeReasonTypes.generateUpdateActions(typesCfg, existentTypesCfg);

        console.log("downtime reasons READ CONFIGURATION");
        const reasonsCfg = smartReductorConfig.readDowntimeReasonsConfiguration();

        console.log("downtime reasons FETCH");
        const existentReasonsCfg = await downtimeReasons.fetch(client);

        console.log("downtime reasons UPDATE ACTIONS");
        const reasonsUpdateActions = await compareDowntimeReasons.generateUpdateActions(client, typesCfg, reasonsCfg, existentReasonsCfg);

        let updateActions = typesUpdateActions.filter((item) => !item.actionName.startsWith("Remove"));
        updateActions = updateActions.concat(reasonsUpdateActions);
        updateActions = updateActions.concat(typesUpdateActions.filter((item) => item.actionName.startsWith("Remove")));

        return { typesCfg: typesCfg, reasonsCfg: reasonsCfg, updateActions: updateActions };
    }

    static async run(client: dpa): Promise<void>
    {
        const cfg = await this.prepareCfg(client);
        this.dumpUpdateActions(cfg.updateActions);

        console.log("downtime reasons EXECUTE UPDATE ACTIONS");
        await this.executeUpdateActions(client, cfg.updateActions);
    }
}
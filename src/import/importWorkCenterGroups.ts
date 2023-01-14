import { compareWorkCenterGroups } from "../compare/compareWorkCenterGroups.js";
import { dpa } from "../dpa.js";
import { workCenterGroups } from "../extract/workCenterGroups.js";
import { smartReductorConfig } from "../smartReductorConfig.js";
import { importBase } from "./importBase.js";

export class importWorkCenterGroups extends importBase
{
    static async prepareCfg(client: dpa): Promise<{ groupsCfg: workCenterGroupCfg[], updateActions: any[] }>
    {
        console.log("workCenter groups READ CONFIGURATION");
        const groupsCfg = smartReductorConfig.readWorkCenterGroupsConfiguration();

        console.log("workCenter groups FETCH");
        const existentCfg = await workCenterGroups.fetch(client);

        console.log("workCenter groups UPDATE ACTIONS");
        const updateActions = compareWorkCenterGroups.generateUpdateActions(groupsCfg, existentCfg);

        return { groupsCfg: groupsCfg, updateActions: updateActions };
    }

    static async run(client: dpa): Promise<void>
    {
        const cfg = await this.prepareCfg(client);
        this.dumpUpdateActions(cfg.updateActions);

        console.log("workCenter groups EXECUTE UPDATE ACTIONS");
        await this.executeUpdateActions(client, cfg.updateActions);
    }
}
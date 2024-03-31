import { compareDashboards } from "../compare/compareDashboards.js";
import { dpa } from "../dpa.js";
import { dashboards } from "../extract/dashboards.js";
import { smartReductorConfig } from "../smartReductorConfig.js";
import { importBase } from "./importBase.js";
import { importEnterpriseStruct } from "./importEnterpriseStruct.js";

export class importDashboards extends importBase
{
    static async prepareCfg(client: dpa, enterpriseCfg: enterpriseCfg): Promise<{ updateActions: any[] }>
    {
        console.log("dashboards READ CONFIGURATION");
        const dashboardsCfg = smartReductorConfig.readDashboardsConfiguration();

        console.log("dashboards FETCH");
        const existentCfg = await dashboards.fetch(client);

        console.log("dashboards UPDATE ACTIONS");
        const updateActions = await compareDashboards.generateUpdateActions(client, dashboardsCfg, existentCfg);

        return { updateActions: updateActions };
    }

    static async run(client: dpa): Promise<void>
    {
        const enterpriseStructCfg = await importEnterpriseStruct.prepareCfg(client);
        if (enterpriseStructCfg.updateActions.length)
            throw "enterprise struct update required!";

        const cfg = await this.prepareCfg(client, enterpriseStructCfg.enterpriseCfg);
        this.dumpUpdateActions(cfg.updateActions);

        console.log("dashboards EXECUTE UPDATE ACTIONS");
        await this.executeUpdateActions(client, cfg.updateActions);
    }
}
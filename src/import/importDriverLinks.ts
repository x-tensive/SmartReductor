import { compareDriverLinks } from "../compare/compareDriverLinks.js";
import { dpa } from "../dpa.js";
import { driverLinks } from "../extract/driverLinks.js";
import { smartReductorConfig } from "../smartReductorConfig.js";
import { importEnterpriseStruct } from "./importEnterpriseStruct.js";
import { importDrivers } from "./importDrivers.js";
import { importBase } from "./importBase.js";

export class importDriverLinks extends importBase
{
    static async prepareCfg(client: dpa, enterprise: enterpriseCfg, drivers: driverCfg[]): Promise<{ driverLinksCfg: driverLinkCfg[], updateActions: any[] }>
    {
        console.log("driver links READ CONFIGURATION");
        const driverLinksCfg = await smartReductorConfig.readDriverLinksConfiguration(client, enterprise, drivers);

        console.log("driver links FETCH");
        const existentCfg = await driverLinks.fetch(client, enterprise);

        console.log("driver links UPDATE ACTIONS");
        const updateActions = await compareDriverLinks.generateUpdateActions(client, driverLinksCfg, existentCfg);

        return { driverLinksCfg: driverLinksCfg, updateActions: updateActions };
    }

    static async run(client: dpa): Promise<void>
    {
        const enterpriseStructCfg = await importEnterpriseStruct.prepareCfg(client);
        if (enterpriseStructCfg.updateActions.length)
            throw "enterprise struct update required!";

        const driversCfg = await importDrivers.prepareCfg(client);
        if (driversCfg.updateActions.length)
            throw "drivers update required!";

        const cfg = await this.prepareCfg(client, enterpriseStructCfg.enterpriseCfg, driversCfg.driversCfg);
        this.dumpUpdateActions(cfg.updateActions);

        console.log("driver links EXECUTE UPDATE ACTIONS");
        await this.executeUpdateActions(client, cfg.updateActions);
    }
}
import { compareDrivers } from "../compare/compareDrivers.js";
import { dpa } from "../dpa.js";
import { drivers } from "../extract/drivers.js";
import { smartReductorConfig } from "../smartReductorConfig.js";
import { importBase } from "./importBase.js";

export class importDrivers extends importBase
{
    static async prepareCfg(client: dpa): Promise<{ driversCfg: driverCfg[], updateActions: any[] }>
    {
        console.log("drivers READ CONFIGURATION");
        const driversCfg = smartReductorConfig.readDriversConfiguration();

        console.log("drivers FETCH");
        const existentCfg = await drivers.fetch(client);

        console.log("drivers UPDATE ACTIONS");
        const updateActions = await compareDrivers.generateUpdateActions(client, driversCfg, existentCfg);

        return { driversCfg: driversCfg, updateActions: updateActions };
    }

    static async run(client: dpa): Promise<void>
    {
        const cfg = await this.prepareCfg(client);
        this.dumpUpdateActions(cfg.updateActions);

        console.log("drivers EXECUTE UPDATE ACTIONS");
        await this.executeUpdateActions(client, cfg.updateActions);
    }
}
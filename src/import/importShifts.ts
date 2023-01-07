import { compareShifts } from "../compare/compareShifts.js";
import { dpa } from "../dpa.js";
import { shifts } from "../extract/shifts.js";
import { smartReductorConfig } from "../smartReductorConfig.js";
import { importBase } from "./importBase.js";

export class importShifts extends importBase
{
    static async prepareCfg(client: dpa): Promise<{ shiftsCfg: any, updateActions: any[] }>
    {
        console.log("shifts READ CONFIGURATION");
        const shiftsCfg = smartReductorConfig.readShiftsConfiguration();

        console.log("shifts FETCH");
        const existentCfg = await shifts.fetch(client);

        console.log("shifts UPDATE ACTIONS");
        const updateActions = compareShifts.generateUpdateActions(shiftsCfg, existentCfg);

        return { shiftsCfg: shiftsCfg, updateActions: updateActions };
    }

    static async run(client: dpa): Promise<void>
    {
        const cfg = await this.prepareCfg(client);
        this.dumpUpdateActions(cfg.updateActions);

        console.log("shifts EXECUTE UPDATE ACTIONS");
        await this.executeUpdateActions(client, cfg.updateActions);
    }
}
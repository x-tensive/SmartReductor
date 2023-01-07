import { compareShiftTemplates } from "../compare/compareShiftTemplates.js";
import { dpa } from "../dpa.js";
import { shiftTemplates } from "../extract/shiftTemplates.js";
import { smartReductorConfig } from "../smartReductorConfig.js";
import { importBase } from "./importBase.js";
import { importShifts } from "./importShifts.js";

export class importShiftTemplates extends importBase
{
    static async prepareCfg(client: dpa, shiftsCfg: any): Promise<{ shiftTemplatesCfg: any, updateActions: any[] }>
    {
        console.log("shift templates READ CONFIGURATION");
        const shiftTemplatesCfg = smartReductorConfig.readShiftTemplatesConfiguration();

        console.log("shift templates FETCH");
        const existentCfg = await shiftTemplates.fetch(client);

        console.log("shift templates UPDATE ACTIONS");
        const updateActions = await compareShiftTemplates.generateUpdateActions(client, shiftsCfg, shiftTemplatesCfg, existentCfg);
        
        return { shiftTemplatesCfg: shiftTemplatesCfg, updateActions: updateActions };
    }

    static async run(client: dpa): Promise<void>
    {
        const shiftsImportCfg = await importShifts.prepareCfg(client);
        if (shiftsImportCfg.updateActions.length)
            throw "shifts update required!";

        const cfg = await this.prepareCfg(client, shiftsImportCfg.shiftsCfg);
        this.dumpUpdateActions(cfg.updateActions);

        console.log("shift templates EXECUTE UPDATE ACTIONS");
        await this.executeUpdateActions(client, cfg.updateActions);
    }
}
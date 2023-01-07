import { compareShiftTemplates } from "../compare/compareShiftTemplates.js";
import { dpa } from "../dpa.js";
import { shiftTemplates } from "../extract/shiftTemplates.js";
import { smartReductorConfig } from "../smartReductorConfig.js";
import { importBase } from "./importBase.js";

export class importShiftTemplates extends importBase
{
    static async run(client: dpa): Promise<void>
    {
        console.log("shift templates READ CONFIGURATION");
        const shiftTemplatesCfg = smartReductorConfig.readShiftTemplatesConfiguration();

        console.log("shift templates FETCH");
        const existentCfg = await shiftTemplates.fetch(client);

        console.log("shift templates UPDATE ACTIONS");
        const updateActions = await compareShiftTemplates.generateUpdateActions(client,  shiftTemplatesCfg, existentCfg);
        this.dumpUpdateActions(updateActions);

        //console.log("shift templates EXECUTE UPDATE ACTIONS");
        //await this.executeUpdateActions(client, updateActions);
    }
}
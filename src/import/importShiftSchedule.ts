import { compareShiftSchedule } from "../compare/compareShiftSchedule.js";
import { dpa } from "../dpa";
import { importBase } from "./importBase.js";
import { importEnterpriseStruct } from "./importEnterpriseStruct.js";
import { importShifts } from "./importShifts.js";
import { importShiftTemplates } from "./importShiftTemplates.js";

export class importShiftSchedule extends importBase
{
    static async run(client: dpa): Promise<void>
    {
        const enterpriseStructImportCfg = await importEnterpriseStruct.prepareCfg(client);
        if (enterpriseStructImportCfg.updateActions.length)
            throw "enterprise struct update required!";

        const shiftsImportCfg = await importShifts.prepareCfg(client);
        if (shiftsImportCfg.updateActions.length)
            throw "shifts update required!";

        const shiftTemplatesCfg = await importShiftTemplates.prepareCfg(client, shiftsImportCfg.shiftsCfg);
        if (shiftTemplatesCfg.updateActions.length)
            throw "shift templates update required!";

        console.log("shift schedule UPDATE ACTIONS");
        const updateActions = await compareShiftSchedule.generateUpdateActions(client, shiftTemplatesCfg.shiftTemplatesCfg, enterpriseStructImportCfg.enterpriseCfg);
        this.dumpUpdateActions(updateActions);

        console.log("shift schedule EXECUTE UPDATE ACTIONS");
        await this.executeUpdateActions(client, updateActions);
    }
}
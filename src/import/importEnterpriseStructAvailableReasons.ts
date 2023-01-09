import { compareEnterpriseStructAvailableReasons } from "../compare/compareEnterpriseStructAvailableReasons.js";
import { dpa } from "../dpa";
import { importBase } from "./importBase.js";
import { importDowntimeReasons } from "./importDowntimeReasons.js";
import { importEnterpriseStruct } from "./importEnterpriseStruct.js";
import { importOperationRunSuspendReasons } from "./importOperationRunSuspendReasons.js";
import { importOvertimeReasons } from "./importOvertimeReasons.js";
import { importUnderproductionReasons } from "./importUnderproductionReasons.js";

export class importEnterpriseStructAvailableReasons extends importBase
{
    static async run(client: dpa): Promise<void>
    {
        const enterpriseStructImportCfg = await importEnterpriseStruct.prepareCfg(client);
        if (enterpriseStructImportCfg.updateActions.length)
            throw "enterprise struct update required!";

        const downtimeReasonsImportCfg = await importDowntimeReasons.prepareCfg(client);
        if (downtimeReasonsImportCfg.updateActions.length)
            throw "downtime reasons update required!";

        const operationRunSuspendReasonsImportCfg = await importOperationRunSuspendReasons.prepareCfg(client);
        if (operationRunSuspendReasonsImportCfg.updateActions.length)
            throw "operation run/suspend reasons update required!";

        const overtimeReasonsImportCfg = await importOvertimeReasons.prepareCfg(client);
        if (overtimeReasonsImportCfg.updateActions.length)
            throw "overtime reasons update required!";

        const underproductionReasonsImportCfg = await importUnderproductionReasons.prepareCfg(client);
        if (underproductionReasonsImportCfg.updateActions.length)
            throw "underproduction reasons update required!";

        console.log("available reasons UPDATE ACTIONS");
        const updateActions = await compareEnterpriseStructAvailableReasons.generateUpdateActions(
            client,
            enterpriseStructImportCfg.enterpriseCfg,
            downtimeReasonsImportCfg.reasonsCfg,
            operationRunSuspendReasonsImportCfg.reasonsCfg,
            overtimeReasonsImportCfg.reasonsCfg,
            underproductionReasonsImportCfg.reasonsCfg
        );
        this.dumpUpdateActions(updateActions);

        console.log("available reasons EXECUTE UPDATE ACTIONS");
        await this.executeUpdateActions(client, updateActions);
    }
}
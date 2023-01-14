import { compareWorkCenterProps } from "../compare/compareWorkCenterProps.js";
import { dpa } from "../dpa";
import { importBase } from "./importBase.js";
import { importEnterpriseStruct } from "./importEnterpriseStruct.js";
import { importWorkCenterGroups } from "./importWorkCenterGroups.js";

export class importWorkCenterProps extends importBase
{
    static async run(client: dpa): Promise<void>
    {
        const enterpriseStructImportCfg = await importEnterpriseStruct.prepareCfg(client);
        if (enterpriseStructImportCfg.updateActions.length)
            throw "enterprise struct update required!";

        const workCenterGroupsImportCfg = await importWorkCenterGroups.prepareCfg(client);
        if (workCenterGroupsImportCfg.updateActions.length)
            throw "workCenter groups update required!";

        console.log("workCenter props UPDATE ACTIONS");
        const updateActions = await compareWorkCenterProps.generateUpdateActions(
            client,
            enterpriseStructImportCfg.enterpriseCfg,
            workCenterGroupsImportCfg.groupsCfg
        );
        this.dumpUpdateActions(updateActions);

        console.log("workCenter props EXECUTE UPDATE ACTIONS");
        await this.executeUpdateActions(client, updateActions);
    }
}
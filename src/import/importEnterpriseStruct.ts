import { dpa } from "../dpa.js";
import { enterpriseStruct } from "../extract/enterpriseStruct.js";
import { smartReductorConfig } from "../smartReductorConfig.js";
import { compareEnterpriseStruct } from "../compare/compareEnterpriseStruct.js";
import { importBase } from "./importBase.js";

export class importEnterpriseStruct extends importBase
{
    static async run(client: dpa): Promise<void>
    {
        console.log("enterprise struct READ CONFIGURATION");
        const enterpriseCfg = smartReductorConfig.readEnterpriseStructConfig();

        console.log("enterprise struct FETCH");
        const existentCfg = await enterpriseStruct.fetch(client);

        console.log("enterprise struct UPDATE ACTIONS");
        const updateActions = compareEnterpriseStruct.generateUpdateActions(enterpriseCfg, existentCfg);
        this.dumpUpdateActions(updateActions);

        console.log("enterprise struct EXECUTE UPDATE ACTIONS");
        await this.executeUpdateActions(client, updateActions);
    }
}
import { dpa } from "../dpa";
import { compareEnterpriseStruct } from "../compare/compareEnterpriseStruct.js";
import { enterpriseStruct } from "../extract/enterpriseStruct.js";
import { smartReductorConfig } from "../smartReductorConfig.js";

export class importShiftSchedule
{
    static async run(client: dpa): Promise<void>
    {
        console.log("enterprise struct READ CONFIGURATION");
        const enterpriseCfg = smartReductorConfig.readEnterpriseStructConfig();

        console.log("enterprise struct FETCH");
        const existentCfg = await enterpriseStruct.fetch(client);

        console.log("enterprise check UPDATE ACTIONS");
        const updateActions = compareEnterpriseStruct.generateUpdateActions(enterpriseCfg, existentCfg);
        if (updateActions.length)
            throw "enterprise struct update required!";

        console.log(JSON.stringify(enterpriseCfg, null, "  "));
    }
}
import { dpa, enterpriseStructTypes } from "../dpa.js";
import chalk from "chalk";
import { enterpriseStruct } from "../extract/enterpriseStruct.js";
import { smartReductorConfig } from "../smartReductorConfig.js";
import { compareEnterpriseStruct } from "../compare/compareEnterpriseStruct.js";

export class importEnterpriseStruct
{
    private static dumpUpdateActions(actions: any[])
    {
        for (const action of actions) {
            if (action.actionName.startsWith("Remove"))
                console.log("  ", chalk.yellow(action.actionName + ":"), "[" + action.id + "]", action.name);
            if (action.actionName.startsWith("Create"))
                console.log("  ", action.actionName + ":", action.cfg.name);
        }
    }

    private static async executeUpdateActions(client: dpa, updateActions: any[])
    {
        for (const action of updateActions) {
            if (action.actionName.startsWith("Remove"))
                process.stdout.write("  " + chalk.yellow(action.actionName + ": ") + "[" + action.id + "] " + action.name);
            if (action.actionName.startsWith("Create"))
                process.stdout.write("  " + action.actionName + ": " + action.cfg.name);

            process.stdout.write(" ...");

            await action.execute(client, action);

            console.log(chalk.green("OK"));
        }
    }

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
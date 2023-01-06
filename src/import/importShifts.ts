import chalk from "chalk";
import { compareShifts } from "../compare/compareShifts.js";
import { dpa } from "../dpa.js";
import { shifts } from "../extract/shifts.js";
import { smartReductorConfig } from "../smartReductorConfig.js";

export class importShifts
{
    private static dumpUpdateActions(actions: any[])
    {
        for (const action of actions) {
            if (action.actionName.startsWith("Remove"))
                console.log("  ", chalk.yellow(action.actionName + ":"), "[" + action.id + "]", action.name);
            if (action.actionName.startsWith("Create"))
                console.log("  ", action.actionName + ":", action.cfg.name);
            if (action.actionName.startsWith("Update"))
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
            if (action.actionName.startsWith("Update"))
                process.stdout.write("  " + action.actionName + ":" + action.cfg.name);

            process.stdout.write(" ...");

            await action.execute(client, action);

            console.log(chalk.green("OK"));
        }
    }
    
    static async run(client: dpa): Promise<void>
    {
        console.log("shifts READ CONFIGURATION");
        const shiftsCfg = smartReductorConfig.readShiftsConfiguration();

        console.log("shifts FETCH");
        const existentCfg = await shifts.fetch(client);

        console.log("shifts UPDATE ACTIONS");
        const updateActions = compareShifts.generateUpdateActions(shiftsCfg, existentCfg);
        this.dumpUpdateActions(updateActions);

        console.log("shifts EXECUTE UPDATE ACTIONS");
        await this.executeUpdateActions(client, updateActions);
    }
}
import chalk from "chalk";
import { dpa } from "../dpa.js";

export abstract class importBase
{
    protected static dumpUpdateActions(actions: any[])
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

    protected static async executeUpdateActions(client: dpa, updateActions: any[])
    {
        for (const action of updateActions) {
            if (action.actionName.startsWith("Remove"))
                process.stdout.write("  " + chalk.yellow(action.actionName + ": ") + "[" + action.id + "] " + action.name);
            if (action.actionName.startsWith("Create"))
                process.stdout.write("  " + action.actionName + ": " + action.cfg.name);
            if (action.actionName.startsWith("Update"))
                process.stdout.write("  " + action.actionName + ": " + action.cfg.name);

            process.stdout.write(" ...");

            await action.execute(client, action);

            console.log(chalk.green("OK"));
        }
    }
} 
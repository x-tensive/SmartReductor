import { dpa } from "./dpa.js";
import chalk from "chalk";

export type dpaImportTarget = "enterpriseStruct" | "shiftTemplates" | "shifts";

export class dpaImport {
    static run(target: dpaImportTarget, client: dpa): void
    {
        console.log(chalk.blueBright("IMPORT", target));
    }
}
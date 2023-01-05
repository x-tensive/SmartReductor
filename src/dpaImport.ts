import { dpa } from "./dpa.js";

export type dpaImportTarget = "enterpriseStruct" | "shiftTemplates" | "shifts";

export class dpaImport {
    static run(target: dpaImportTarget, client: dpa): void
    {
        console.log("IMPORT", target);
    }
}
#!/usr/bin/env node

import fs from "fs";
import * as url from "url";
import path from "path";
import yargs, { CommandBuilder, CommandModule } from "yargs";
import { hideBin } from "yargs/helpers";
import chalk from "chalk";
import { dpa } from "./dpa.js";
import { enterpriseStruct } from "./extract/enterpriseStruct.js";
import { importEnterpriseStruct } from "./import/importEnterpriseStruct.js";
import { importShiftSchedule } from "./import/importShiftSchedule.js";
import { importShifts } from "./import/importShifts.js";
import { shifts } from "./extract/shifts.js";
import { shiftTemplates } from "./extract/shiftTemplates.js";
import { importShiftTemplates } from "./import/importShiftTemplates.js";
import { downtimeReasonTypes } from "./extract/downtimeReasonTypes.js";
import { downtimeReasons } from "./extract/downtimeReasons.js";
import { importDowntimeReasons } from "./import/importDowntimeReasons.js";
import { operationRunSuspendReasons } from "./extract/operationRunSuspendReasons.js";
import { importOperationRunSuspendReasons } from "./import/importOperationRunSuspendReasons.js";
import { overtimeReasons } from "./extract/overtimeReasons.js";
import { importOvertimeReasons } from "./import/importOvertimeReasons.js";
import { underproductionReasons } from "./extract/underproductionReasons.js";
import { importUnderproductionReasons } from "./import/importUnderproductionReasons.js";
import { importEnterpriseStructAvailableReasons } from "./import/importEnterpriseStructAvailableReasons.js";
import { importSettings } from "./import/importSettings.js";
import { settings } from "./extract/settings.js";
import { workCenterGroups } from "./extract/workCenterGroups.js";
import { importWorkCenterGroups } from "./import/importWorkCenterGroups.js";
import { importWorkCenterProps } from "./import/importWorkCenterProps.js";
import { threeDimensionalModels } from "./extract/3DModels.js";
import { import3DModels } from "./import/import3DModels.js";
import { import3DModelsAttachments } from "./import/import3DModelsAttachments.js";
import { importDashboards } from "./import/importDashboards.js";
import { drivers } from "./extract/drivers.js";
import { importDrivers } from "./import/importDrivers.js";
import { importAll } from "./import/importAll.js";

const dirName = url.fileURLToPath(new URL(".", import.meta.url));
const packageJsonFileName = path.join(dirName, "..",  "package.json");
const packageJsonContent = fs.readFileSync(packageJsonFileName, { encoding: "utf8" });
const packageJson = JSON.parse(packageJsonContent);

const connectionArgsBuilder: CommandBuilder = {
    url :{
        describe: "dpa host url",
        default: "http://127.0.0.1",
        type: "string"
    },
    user :{
        describe: "dpa user name",
        default: "admin",
        type: "string"
    },
    password :{
        describe: "dpa user password",
        default: "password",
        type: "string"
    }
}

const createConnectionBoundCommandModule = (parentCommand: string, command: string, description: string, handler: (client: dpa) => Promise<void>) => {
    const commandModule: CommandModule = {
        command: command,
        describe: description,
        builder: connectionArgsBuilder,
        handler: async (parsed: any) => {
            const client = await dpa.login(parsed.url, parsed.user, parsed.password);
            console.log(await client.getHostName(), await client.getHostVersion());
            try {
                console.log(chalk.blueBright(parentCommand, command));
                await handler(client);
            }
            catch (exception: any) {
                console.log(chalk.red(exception.toString()));
            }
            finally {
                await client.logout();
            }
        }
    }
    return commandModule;
}

const createImportCommandModule = (command: string, description: string, handler: (client: dpa) => Promise<void>) => {
    return createConnectionBoundCommandModule("import", command, description, handler);
}

const createDumpCommandModule = (command: string, description: string, handler: (client: dpa) => Promise<any>) => {
    return createConnectionBoundCommandModule("dump", command, description, async (client: dpa) => {
        console.log(JSON.stringify(await handler(client), undefined, 2))
    });
}

yargs(hideBin(process.argv))
    .command({
        command: "import <target>",
        describe: "imports info",
        handler: async (parsed: any) => {},
        builder: function(yargs) {
            return yargs
                .command(createImportCommandModule(
                    "all",
                    "import all data",
                    (client: dpa) => importAll.run(client)))
                .command(createImportCommandModule(
                    "enterpriseStruct",
                    "import enterprise structure",
                    (client: dpa) => importEnterpriseStruct.run(client)))
                .command(createImportCommandModule(
                    "shifts",
                    "import shifts",
                    (client: dpa) => importShifts.run(client)))
                .command(createImportCommandModule(
                    "shiftTemplates",
                    "import shifts templates",
                    (client: dpa) => importShiftTemplates.run(client)))
                .command(createImportCommandModule(
                    "shiftSchedule",
                    "import shifts schedule",
                    (client: dpa) => importShiftSchedule.run(client)))
                .command(createImportCommandModule(
                    "downtimeReasons",
                    "import downtime reasons",
                    (client: dpa) => importDowntimeReasons.run(client)))
                .command(createImportCommandModule(
                    "operationRunSuspendReasons",
                    "import operationRunSuspend reasons",
                    (client: dpa) => importOperationRunSuspendReasons.run(client)))
                .command(createImportCommandModule(
                    "overtimeReasons",
                    "import overtime reasons",
                    (client: dpa) => importOvertimeReasons.run(client)))
                .command(createImportCommandModule(
                    "underproductionReasons",
                    "import underproduction reasons",
                    (client: dpa) => importUnderproductionReasons.run(client)))
                .command(createImportCommandModule(
                    "enterpriseStructAvailableReasons",
                    "import enterpriseStruct available reasons",
                    (client: dpa) => importEnterpriseStructAvailableReasons.run(client)))
                .command(createImportCommandModule(
                    "settings",
                    "import settings",
                    (client: dpa) => importSettings.run(client)))
                .command(createImportCommandModule(
                    "workCenterGroups",
                    "import workCenter groups",
                    (client: dpa) => importWorkCenterGroups.run(client)))
                .command(createImportCommandModule(
                    "workCenterProps",
                    "import workCenter props",
                    (client: dpa) => importWorkCenterProps.run(client)))
                .command(createImportCommandModule(
                    "3DModels",
                    "import 3D models",
                    (client: dpa) => import3DModels.run(client)))
                .command(createImportCommandModule(
                    "attach3DModels",
                    "import 3D models attachments",
                    (client: dpa) => import3DModelsAttachments.run(client)))
                .command(createImportCommandModule(
                    "dashboards",
                    "import dashboards",
                    (client: dpa) => importDashboards.run(client)))
                .command(createImportCommandModule(
                    "drivers",
                    "import drivers",
                    (client: dpa) => importDrivers.run(client)));
        }
    })
    .command({
        command: "dump <target>",
        describe: "dumps info",
        handler: async (parsed: any) => {},
        builder: function(yargs) {
            return yargs
                .command(createDumpCommandModule(
                    "enterpriseStruct",
                    "dump enterprise structure",
                    (client: dpa) => enterpriseStruct.fetch(client)))
                .command(createDumpCommandModule(
                    "shifts",
                    "dump shifts",
                    (client: dpa) => shifts.fetch(client)))
                .command(createDumpCommandModule(
                    "shiftTemplates",
                    "dump shifts templates",
                    (client: dpa) => shiftTemplates.fetch(client)))
                .command(createDumpCommandModule(
                    "downtimeReasonTypes",
                    "dump downtime reason types",
                    (client: dpa) => downtimeReasonTypes.fetch(client)))
                .command(createDumpCommandModule(
                    "downtimeReasons",
                    "dump downtime reasons",
                    (client: dpa) => downtimeReasons.fetch(client)))
                .command(createDumpCommandModule(
                    "operationRunSuspendReasons",
                    "dump operationRunSuspend reasons",
                    (client: dpa) => operationRunSuspendReasons.fetch(client)))
                .command(createDumpCommandModule(
                    "overtimeReasons",
                    "dump overtime reasons",
                    (client: dpa) => overtimeReasons.fetch(client)))
                .command(createDumpCommandModule(
                    "underproductionReasons",
                    "dump underproduction reasons",
                    (client: dpa) => underproductionReasons.fetch(client)))
                .command(createDumpCommandModule(
                    "settings",
                    "dump settings",
                    (client: dpa) => settings.fetch(client)))
                .command(createDumpCommandModule(
                    "workCenterGroups",
                    "dump workCenter groups",
                    (client: dpa) => workCenterGroups.fetch(client)))
                .command(createDumpCommandModule(
                    "3DModels",
                    "dump 3D models",
                    (client: dpa) => threeDimensionalModels.fetch(client)))
                .command(createDumpCommandModule(
                    "drivers",
                    "dump drivers",
                    (client: dpa) => drivers.fetch(client)));
        }
    })
    .version(packageJson.version)
    .help()
    .showHelpOnFail(false)
    .demandCommand()
    .strict()
    .argv;
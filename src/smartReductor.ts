#!/usr/bin/env node

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
                    "enterpriseStruct",
                    "import enterprise structure",
                    importEnterpriseStruct.run))
                .command(createImportCommandModule(
                    "shifts",
                    "import shifts",
                    importShifts.run))
                .command(createImportCommandModule(
                    "shiftTemplates",
                    "import shifts templates",
                    importShiftTemplates.run))
                .command(createImportCommandModule(
                    "shiftSchedule",
                    "import shifts schedule",
                    importShiftSchedule.run))
                .command(createImportCommandModule(
                    "downtimeReasons",
                    "import downtime reasons",
                    importDowntimeReasons.run))
                .command(createImportCommandModule(
                    "operationRunSuspendReasons",
                    "import operationRunSuspend reasons",
                    importOperationRunSuspendReasons.run))
                .command(createImportCommandModule(
                    "overtimeReasons",
                    "import overtime reasons",
                    importOvertimeReasons.run))
                .command(createImportCommandModule(
                    "underproductionReasons",
                    "import underproduction reasons",
                    importUnderproductionReasons.run))
                .command(createImportCommandModule(
                    "enterpriseStructAvailableReasons",
                    "import enterpriseStruct available reasons",
                    importEnterpriseStructAvailableReasons.run))
                .command(createImportCommandModule(
                    "settings",
                    "import settings",
                    importSettings.run))
                .command(createImportCommandModule(
                    "workCenterGroups",
                    "import workCenter groups",
                    importWorkCenterGroups.run))
                .command(createImportCommandModule(
                    "workCenterProps",
                    "import workCenter props",
                    importWorkCenterProps.run));
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
                    enterpriseStruct.fetch))
                .command(createDumpCommandModule(
                    "shifts",
                    "dump shifts",
                    shifts.fetch))
                .command(createDumpCommandModule(
                    "shiftTemplates",
                    "dump shifts templates",
                    shiftTemplates.fetch))
                .command(createDumpCommandModule(
                    "downtimeReasonTypes",
                    "dump downtime reason types",
                    downtimeReasonTypes.fetch))
                .command(createDumpCommandModule(
                    "downtimeReasons",
                    "dump downtime reasons",
                    downtimeReasons.fetch))
                .command(createDumpCommandModule(
                    "operationRunSuspendReasons",
                    "dump operationRunSuspend reasons",
                    operationRunSuspendReasons.fetch))
                .command(createDumpCommandModule(
                    "overtimeReasons",
                    "dump overtime reasons",
                    overtimeReasons.fetch))
                .command(createDumpCommandModule(
                    "underproductionReasons",
                    "dump underproduction reasons",
                    underproductionReasons.fetch))
                .command(createDumpCommandModule(
                    "settings",
                    "dump settings",
                    settings.fetch))
                .command(createDumpCommandModule(
                    "workCenterGroups",
                    "dump workCenter groups",
                    workCenterGroups.fetch));
        }
    })
    .help()
    .showHelpOnFail(false)
    .demandCommand()
    .strict()
    .argv;
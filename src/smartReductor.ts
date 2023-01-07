import yargs, { CommandBuilder } from "yargs";
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

const targetBuilder: CommandBuilder = {
    target: {
        demand: true,
        choices: [
            "enterpriseStruct",
            "shiftTemplates",
            "shifts",
            "shiftSchedule"
        ] as const
    },
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
};

yargs(hideBin(process.argv))
    .command({
        command: "import <target> [url] [user] [password]",
        describe: "imports data",
        handler: async (parsed: any) => {
            const client = await dpa.login(parsed.url, parsed.user, parsed.password);
            console.log(await client.getHostName(), await client.getHostVersion());
            try {
                console.log(chalk.blueBright("IMPORT", parsed.target));
                if (parsed.target == "enterpriseStruct")
                    await importEnterpriseStruct.run(client);
                else if (parsed.target == "shifts")
                    await importShifts.run(client);
                else if (parsed.target == "shiftTemplates")
                    await importShiftTemplates.run(client);
                else if (parsed.target == "shiftSchedule")
                    await importShiftSchedule.run(client);
                else
                    throw "not supported";
            }
            catch (exception: any) {
                console.log(chalk.red(exception.toString()));
            }
            finally {
                await client.logout();
            }
        },
        builder: targetBuilder
    })
    .command({
        command: "dump <target> [url] [user] [password]",
        describe: "dumps info",
        handler: async (parsed: any) => {
            const client = await dpa.login(parsed.url, parsed.user, parsed.password);
            console.log(await client.getHostName(), await client.getHostVersion());
            try {
                if (parsed.target == "enterpriseStruct")
                    console.log(JSON.stringify(await enterpriseStruct.fetch(client), undefined, 2));
                else if (parsed.target == "shifts")
                    console.log(JSON.stringify(await shifts.fetch(client), undefined, 2));
                else if (parsed.target == "shiftTemplates")
                    console.log(JSON.stringify(await shiftTemplates.fetch(client), undefined, 2));
                else
                    throw "not supported";
            }
            catch (exception: any) {
                console.log(chalk.red(exception.toString()));
            }
            finally {
                await client.logout();
            }
        },
        builder: targetBuilder
    })
    .help()
    .strict()
    .argv;
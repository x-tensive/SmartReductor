import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { dpa } from "./dpa.js";
import { dpaImport } from "./dpaImport.js";

yargs(hideBin(process.argv))
    .command({
        command: "import <target> [url] [user] [password]",
        describe: "imports data",
        handler: (parsed: any) => {
            const client = dpa.login(parsed.url, parsed.user, parsed.password);
            console.log(client.getHostName(), client.getHostVersion());
            try {
                dpaImport.run(parsed.target, client);
            } finally {
                client.logout();
            }
        },
        builder: {
            target: {
                demand: true,
                choices: [
                    "enterpriseStruct",
                    "shiftTemplates",
                    "shifts"
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
        }
    })
    .help()
    .strict()
    .argv;
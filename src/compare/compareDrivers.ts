import { dpa } from "../dpa";
import fs from "fs";

export class compareDrivers
{
    public static async generateUpdateActions(client: dpa, driversCfg: driverCfg[], existentCfg: driverCfg[]): Promise<any[]>
    {
        let actions: any[] = [];

        for (const existentDriverCfg of existentCfg) {
            const driverCfg = driversCfg.find((item: driverCfg) => item.serverName == existentDriverCfg.serverName && item.name == existentDriverCfg.name);
            if (!driverCfg) {
                actions.push({
                    actionName: "RemoveDriver",
                    serverName: existentDriverCfg.serverName,
                    driverIdentifier: existentDriverCfg.driverConfigurationInfo.identifier,
                    execute: async (client: dpa, action: any) => {
                        await client.driver_remove(action.serverName, action.driverIdentifier);
                    }
                });
            }
        }

        for (const driverCfg of driversCfg) {
            const existentDriverCfg = existentCfg.find((item: driverCfg) => item.serverName == driverCfg.serverName && item.name == driverCfg.name);
            if (existentDriverCfg) {
                if (!driverCfg.driverConfigurationInfo)
                    driverCfg.driverConfigurationInfo = {};
                driverCfg.driverConfigurationInfo.identifier = existentDriverCfg.driverConfigurationInfo.identifier;
            } else {
                if (!driverCfg.serverName)
                    throw "DPA server name is not specified!"
                if (!driverCfg.deviceTree_fileName)
                    throw "deviceTree file name is not specified!"
                const endpoint = driverCfg.driverConfigurationInfo?.endpoint;
                if (!endpoint)
                    throw "endpoint is not specified!"
                actions.push({
                    actionName: "CreateDriver",
                    cfg: driverCfg,
                    execute: async (client: dpa, action: any) => {
                        const deviceTree = fs.readFileSync("./data/drivers/" + driverCfg.deviceTree_fileName).toString();
                        const deviceCfg = await client.driver_opcua_getDeviceConfiguration(driverCfg.serverName!, endpoint.sourceUri, endpoint.name, endpoint.securityMode, driverCfg.deviceTree_fileName!, deviceTree);
                        driverCfg.driverConfigurationInfo.rootDeviceInfo = deviceCfg;
                        const data = await client.driver_create(driverCfg);
                    }
                });
            }
        }

        return actions;
    }
}
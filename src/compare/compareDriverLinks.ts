import { dpa } from "../dpa";
import fs from "fs";

export class compareDriverLinks
{
    public static async generateUpdateActions(client: dpa, driverLinksCfg: driverLinkCfg[], existentCfg: driverLinkCfg[]): Promise<any[]>
    {
        let actions: any[] = [];

        const servers = await client.dpaServers_list();

        for (const existentDriverLinkCfg of existentCfg) {
            const driverLinkCfg = driverLinksCfg.find((item) => item.workCenterId == existentDriverLinkCfg.workCenterId && item.driverIdentifier == existentDriverLinkCfg.driverIdentifier);
            if (!driverLinkCfg && existentDriverLinkCfg.driverInfo) {
                actions.push({
                    actionName: "RemoveDriverLink",
                    id: existentDriverLinkCfg.workCenterId,
                    name: existentDriverLinkCfg.driverInfo,
                    cfg: existentDriverLinkCfg,
                    execute: async (client: dpa, action: any) => {
                        let workCenter = await client.manageEnterpriseStructure_getWorkCenter(action.cfg.workCenterId);
                        workCenter.serverId = 0;
                        workCenter.serverName = null;
                        workCenter.driverIdentifier = "00000000-0000-0000-0000-000000000000";
                        workCenter.driverinfo = null;
                        await client.manageEnterpriseStructure_updateWorkCenter(workCenter);
                    }
                });
            }
        }

        for (const driverLinkCfg of driverLinksCfg) {
            const existentDriverLinkCfg = existentCfg.find((item) => item.workCenterId == driverLinkCfg.workCenterId && item.driverIdentifier == driverLinkCfg.driverIdentifier);
            if (!existentDriverLinkCfg && driverLinkCfg.driverInfo) {
                actions.push({
                    actionName: "CreateDriverLink",
                    cfg: { ...driverLinkCfg, name: "[" + driverLinkCfg.workCenterId + "] " + driverLinkCfg.driverInfo },
                    execute: async (client: dpa, action: any) => {
                        const server = servers.find((item) => item.name == action.cfg.driverInfo.split('/')[0]);
                        let workCenter = await client.manageEnterpriseStructure_getWorkCenter(action.cfg.workCenterId);
                        workCenter.driverIdentifier = action.cfg.driverIdentifier;
                        workCenter.driverinfo = action.cfg.driverInfo;
                        workCenter.serverId = server!.id;
                        await client.manageEnterpriseStructure_updateWorkCenter(workCenter);
                        if (action.cfg.driverCfg_fileName) {
                            const driverCfg = fs.readFileSync("./data/drivers/" + action.cfg.driverCfg_fileName).toString();
                            await client.driver_importSettings(server!.name, action.cfg.driverIdentifier, action.cfg.driverCfg_fileName, driverCfg);
                            await client.driver_importWorkCenterSettings(server!.id!, action.cfg.driverIdentifier, action.cfg.workCenterId, action.cfg.driverCfg_fileName, driverCfg);
                        }
                    }
                });
            }
        }

        return actions;
    }
}
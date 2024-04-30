import { dpa } from "../dpa.js";

export class drivers
{
    public static async fetch(client: dpa): Promise<driverCfg[]>
    {
        let result = new Array<driverCfg>();
        const servers = await client.dpaServers_list();
        for (const server of servers) {
            const driverRefs = await client.drivers_list(server.name);
            for (const driverRef of driverRefs) {
                const driver = await client.driver_get(server.name, driverRef.driverIdentifier);
                result.push(driver);
            }
        }
        return result;
    }
}
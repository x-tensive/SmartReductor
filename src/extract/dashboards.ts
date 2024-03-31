import { dpa } from "../dpa.js";

export class dashboards
{
    public static async fetch(client: dpa): Promise<any[]>
    {
        return await client.dashboards_list();
    }
}
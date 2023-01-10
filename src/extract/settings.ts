import { dpa } from "../dpa.js";

export class settings
{
    public static async fetch(client: dpa): Promise<any[]>
    {
        const result = await client.settings_getGroups();
        return result;
    }
}
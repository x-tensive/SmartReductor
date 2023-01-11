import { dpa } from "../dpa.js";

export class workCenterGroups
{
    public static async fetch(client: dpa): Promise<any[]>
    {
        const result = await client.referenceBook_getWorkCenterGroups();
        return result.data;
    }
}
import { dpa } from "../dpa.js";

export class downtimeReasons
{
    public static async fetch(client: dpa): Promise<any[]>
    {
        const result = await client.referenceBook_getDowntimeReasons();
        return result.data;
    }
}
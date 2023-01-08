import { dpa } from "../dpa.js";

export class downtimeReasonTypes
{
    public static async fetch(client: dpa): Promise<any[]>
    {
        const result = await client.referenceBook_getDowntimeReasonTypes();
        return result.data;
    }
}
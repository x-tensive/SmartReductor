import { dpa } from "../dpa.js";

export class shifts
{
    public static async fetch(client: dpa): Promise<any[]>
    {
        const result = await client.referenceBook_getShifts();
        return result.data;
    }
}
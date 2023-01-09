import { dpa } from "../dpa.js";

export class overtimeReasons
{
    public static async fetch(client: dpa): Promise<any[]>
    {
        const result = await client.referenceBook_getOvertimeReasons();
        return result.data;
    }
}
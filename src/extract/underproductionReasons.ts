import { dpa } from "../dpa.js";

export class underproductionReasons
{
    public static async fetch(client: dpa): Promise<any[]>
    {
        const result = await client.referenceBook_getUnderproductionReasons();
        return result.data;
    }
}
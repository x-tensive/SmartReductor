import { dpa } from "../dpa.js";

export class operationRunSuspendReasons
{
    public static async fetch(client: dpa): Promise<any[]>
    {
        const result = await client.referenceBook_getOperationRunSuspendReasons();
        return result.data;
    }
}
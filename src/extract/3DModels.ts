import { dpa } from "../dpa.js";

export class threeDimensionalModels
{
    public static async fetch(client: dpa): Promise<any[]>
    {
        const result = await client.threeDimensionalModel_list();
        return result.map((r: any) =>  { return {
            id: r.id,
            name: r.name,
            description: r.description,
            fileName: r.originalModelFile.fileName,
            data: r.originalModelFile.data,
        }; });
    }
}
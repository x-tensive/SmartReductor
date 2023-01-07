import { dpa } from "../dpa.js";

export class shiftTemplates
{
    public static async fetch(client: dpa): Promise<any[]>
    {
        const result = await client.referenceBook_getShiftTemplates();
        const templates = result.data;
        for (const template of templates) {
            const record = await client.referenceBook_getShiftTemplate(template.id);
            template.intervals = record.intervals;
        }
        return templates;
    }
}
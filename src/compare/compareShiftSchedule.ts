import { dpa, enterpriseStructTypes } from "../dpa.js";

export class compareShiftSchedule
{
    private static currentDateAddDays(days: number): Date
    {
        let date = new Date();
        date.setDate(date.getDate() + days);
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        return date;
    }

    private static async applyTemplate(client: dpa, shiftTemplatesCfg: any[], cfg: any, typeName: string)
    {
        if (typeof cfg.shiftSchedule === "undefined")
            throw "shiftSchedule is undefined";
        if (typeof cfg.shiftScheduleBefore === "undefined")
            throw "shiftScheduleBefore is undefined";
        if (typeof cfg.shiftScheduleAfter === "undefined")
            throw "shiftScheduleAfter is undefined";

        const ownerTypes = await client.getShiftScheduleOwnerTypes();
        const ownerTypeId = ownerTypes.byEnum(typeName)!.id;
        const templateId = shiftTemplatesCfg.find((item) => item.name == cfg.shiftSchedule)!.id;
        const before = this.currentDateAddDays(-cfg.shiftScheduleBefore);
        const after = this.currentDateAddDays(cfg.shiftScheduleAfter);
        
        await client.shiftSchedule_applyTemplate(ownerTypeId, cfg.id, templateId, before.toISOString(), after.toISOString());
    }

    private static async attachToParent(client: dpa, cfg: any, typeName: string)
    {
        const ownerTypes = await client.getShiftScheduleOwnerTypes();
        const ownerTypeId = ownerTypes.byEnum(typeName)!.id;

        await client.shiftSchedule_attachToParent(ownerTypeId, cfg.id, );
    }

    private static async isShiftScheduleInherited(client: dpa, typeName: string, id: number): Promise<boolean>
    {
        const ownerTypes = await client.getShiftScheduleOwnerTypes();
        const ownerTypeId = ownerTypes.byEnum(typeName)!.id;
        const before = this.currentDateAddDays(-1);
        const after = this.currentDateAddDays(1);

        const result = await client.shiftSchedule_get(ownerTypeId, id, true, before.toISOString(), after.toISOString());

        return result.scheduleOwnerId != id;
    }

    private static generateApplyTemplateAction(actionName: string, typeName: string, cfg: any, shiftTemplatesCfg: any[]): any
    {
        return {
            actionName: actionName,
            cfg: cfg,
            typeName: typeName,
            execute: async (client: dpa, action: any) => {
                await this.applyTemplate(client, shiftTemplatesCfg, action.cfg, action.typeName);
            }
        }
    }

    private static generateAttachToParenteAction(actionName: string, typeName: string, cfg: any): any
    {
        return {
            actionName: actionName,
            cfg: cfg,
            typeName: typeName,
            execute: async (client: dpa, action: any) => {
                await this.attachToParent(client, action.cfg, action.typeName);
            }
        }
    }

    private static async generateUpdateActions_workCenter(client: dpa, shiftTemplatesCfg: any[], workCenterCfg: any, actions: any[]): Promise<void>
    {
        if (workCenterCfg.shiftSchedule) {
            actions.push(this.generateApplyTemplateAction("UpdateWorkCenter", "Equipment", workCenterCfg, shiftTemplatesCfg));
        } else {
            const isInherited = await this.isShiftScheduleInherited(client, "Equipment", workCenterCfg.id);
            if (!isInherited) {
                actions.push(this.generateAttachToParenteAction("UpdateWorkCenter", "Equipment", workCenterCfg));
            }
        }
    }

    private static async generateUpdateActions_department(client: dpa, shiftTemplatesCfg: any[], departmentCfg: any, actions: any[]): Promise<void>
    {
        if (departmentCfg.shiftSchedule) {
            actions.push(this.generateApplyTemplateAction("UpdateDepartment", "Department", departmentCfg, shiftTemplatesCfg));
        } else {
            const isInherited = await this.isShiftScheduleInherited(client, "Department", departmentCfg.id);
            if (!isInherited) {
                actions.push(this.generateAttachToParenteAction("UpdateDepartment", "Department", departmentCfg));
            }
        }

        if (departmentCfg.departments) {
            for (const subDepartmentCfg of departmentCfg.departments)
                await this.generateUpdateActions_department(client, shiftTemplatesCfg, subDepartmentCfg, actions);
        }
        if (departmentCfg.workCenters) {
            for (const workCenterCfg of departmentCfg.workCenters)
                await this.generateUpdateActions_workCenter(client, shiftTemplatesCfg, workCenterCfg, actions);
        }
    }

    private static async generateUpdateActions_site(client: dpa, shiftTemplatesCfg: any[], siteCfg: any, actions: any[]): Promise<void>
    {
        if (siteCfg.shiftSchedule) {
            actions.push(this.generateApplyTemplateAction("UpdateSite", "Site", siteCfg, shiftTemplatesCfg));
        } else {
            const isInherited = await this.isShiftScheduleInherited(client, "Site", siteCfg.id);
            if (!isInherited) {
                actions.push(this.generateAttachToParenteAction("UpdateSite", "Site", siteCfg));
            }
        }

        if (siteCfg.departments) {
            for (const departmentCfg of siteCfg.departments)
                await this.generateUpdateActions_department(client, shiftTemplatesCfg, departmentCfg, actions);
        }
    }

    public static async generateUpdateActions(client: dpa, shiftTemplatesCfg: any[], enterpriseStructCfg: any): Promise<any[]>
    {
        let actions: any[] = [];

        actions.push(this.generateApplyTemplateAction("UpdateEnterprise", "Enterprise", enterpriseStructCfg, shiftTemplatesCfg));

        if (enterpriseStructCfg.sites) {
            for (const siteCfg of enterpriseStructCfg.sites)
                await this.generateUpdateActions_site(client, shiftTemplatesCfg, siteCfg, actions);
        }

        return actions;
    }
}
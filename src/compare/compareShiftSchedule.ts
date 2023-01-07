import { dpa, enterpriseStructTypes } from "../dpa.js";

export class compareShiftSchedule
{
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
        const before = new Date();
        before.setDate(before.getDate() - cfg.shiftScheduleBefore);
        before.setHours(0);
        before.setMinutes(0);
        before.setSeconds(0);
        before.setMilliseconds(0);
        const after = new Date();
        after.setDate(after.getDate() + cfg.shiftScheduleAfter);
        after.setHours(0);
        after.setMinutes(0);
        after.setSeconds(0);
        after.setMilliseconds(0);
        
        await client.applyShiftScheduleTemplate(ownerTypeId, cfg.id, templateId, before.toISOString(), after.toISOString());
    }

    private static async attachToParent(client: dpa, cfg: any, typeName: string)
    {
        const ownerTypes = await client.getShiftScheduleOwnerTypes();
        const ownerTypeId = ownerTypes.byEnum(typeName)!.id;

        await client.attachShiftScheduleToParent(ownerTypeId, cfg.id, );
    }

    public static async generateUpdateActions_workCenter(client: dpa, shiftTemplatesCfg: any[], workCenterCfg: any, actions: any[]): Promise<void>
    {
        if (workCenterCfg.shiftSchedule) {
            actions.push({
                actionName: "UpdateWorkCenter",
                cfg: workCenterCfg,
                typeName: "Equipment",
                execute: async (client: dpa, action: any) => {
                    const site = await this.applyTemplate(client, shiftTemplatesCfg, action.cfg, action.typeName);
                }
            });
        } else {
            const workCenter = await client.manageEnterpriseStructure_getWorkCenter(workCenterCfg.id);
            if (!workCenter.inherit) {
                actions.push({
                    actionName: "UpdateWorkCenter",
                    cfg: workCenterCfg,
                    typeName: "Equipment",
                    execute: async (client: dpa, action: any) => {
                        const site = await this.attachToParent(client, action.cfg, action.typeName);
                    }
                });
            }
        }
    }

    public static async generateUpdateActions_department(client: dpa, shiftTemplatesCfg: any[], departmentCfg: any, actions: any[]): Promise<void>
    {
        if (departmentCfg.shiftSchedule) {
            actions.push({
                actionName: "UpdateDepartment",
                cfg: departmentCfg,
                typeName: "Department",
                execute: async (client: dpa, action: any) => {
                    const site = await this.applyTemplate(client, shiftTemplatesCfg, action.cfg, action.typeName);
                }
            });
        } else {
            const department = await client.manageEnterpriseStructure_getDepartment(departmentCfg.id);
            if (!department.inherit) {
                actions.push({
                    actionName: "UpdateDepartment",
                    cfg: departmentCfg,
                    typeName: "Department",
                    execute: async (client: dpa, action: any) => {
                        const site = await this.attachToParent(client, action.cfg, action.typeName);
                    }
                });
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

    public static async generateUpdateActions_site(client: dpa, shiftTemplatesCfg: any[], siteCfg: any, actions: any[]): Promise<void>
    {
        if (siteCfg.shiftSchedule) {
            actions.push({
                actionName: "UpdateSite",
                cfg: siteCfg,
                typeName: "Site",
                execute: async (client: dpa, action: any) => {
                    const site = await this.applyTemplate(client, shiftTemplatesCfg, action.cfg, action.typeName);
                }
            });
        } else {
            const site = await client.manageEnterpriseStructure_getSite(siteCfg.id);
            if (!site.inherit) {
                actions.push({
                    actionName: "UpdateSite",
                    cfg: siteCfg,
                    typeName: "Site",
                    execute: async (client: dpa, action: any) => {
                        const site = await this.attachToParent(client, action.cfg, action.typeName);
                    }
                });
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

        actions.push({
            actionName: "UpdateEnterprise",
            cfg: enterpriseStructCfg,
            typeName: "Enterprise",
            execute: async (client: dpa, action: any) => {
                const site = await this.applyTemplate(client, shiftTemplatesCfg, action.cfg, action.typeName);
            }
        });

        if (enterpriseStructCfg.sites) {
            for (const siteCfg of enterpriseStructCfg.sites)
                await this.generateUpdateActions_site(client, shiftTemplatesCfg, siteCfg, actions);
        }

        return actions;
    }
}
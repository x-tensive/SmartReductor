import { dpa } from "../dpa.js";

export class compareEnterpriseStruct
{
    private static generateRemoveActions_workCenter(workCenter: any, actions: any[])
    {
        actions.push({
            actionName: "RemoveWorkCenter",
            id: workCenter.id,
            name: workCenter.name,
            execute: async (client: dpa, action: any) => {
                await client.manageEnterpriseStructure_removeWorkCenter(action.id);
            }
        });
    }

    private static generateRemoveActions_storageZone(storageZone: any, actions: any[])
    {
        actions.push({
            actionName: "RemoveStorageZone",
            id: storageZone.id,
            name: storageZone.name,
            execute: async (client: dpa, action: any) => {
                await client.manageEnterpriseStructure_removeStorageZone(action.id);
            }
        });
    }

    private static generateRemoveActions_department(department: any, actions: any[])
    {
        for (const subDepartmentCfg of department.departments) this.generateRemoveActions_department(subDepartmentCfg,  actions);
        for (const workCenterCfg of department.workCenters) this.generateRemoveActions_workCenter(workCenterCfg, actions);
        for (const storageZoneCfg of department.storageZones) this.generateRemoveActions_storageZone(storageZoneCfg, actions);
        actions.push({
            actionName: "RemoveDepartment",
            id: department.id,
            name: department.name,
            execute: async (client: dpa, action: any) => {
                await client.manageEnterpriseStructure_removeDepartment(action.id);
            }
        });
    }

    private static generateRemoveActions_site(site: any, actions: any[])
    {
        for (const departmentCfg of site.departments) this.generateRemoveActions_department(departmentCfg,  actions);
        actions.push({
            actionName: "RemoveSite",
            id: site.id,
            name: site.name,
            execute: async (client: dpa, action: any) => {
                await client.manageEnterpriseStructure_removeSite(action.id);
            }
        });
    }

    private static generateRemoveActions_enterprise(enterprise: any, actions: any[])
    {
        for (const siteCfg of enterprise.sites) this.generateRemoveActions_site(siteCfg, actions);
        actions.push({
            actionName: "RemoveEnterprise",
            id: enterprise.id,
            name: enterprise.name,
            execute: async (client: dpa, action: any) => {
                await client.manageEnterpriseStructure_removeEnterprise(action.id);
            }
        });
    }

    private static generateCreateActions_workCenter(departmentCfg: departmentCfg, workCenterCfg: workCenterCfg, actions: any[])
    {
        actions.push({
            actionName: "CreateWorkCenter",
            cfg: workCenterCfg,
            departmentCfg: departmentCfg,
            execute: async (client: dpa, action: any) => {
                const workCenter = await client.manageEnterpriseStructure_createWorkCenter(action.departmentCfg.id, action.cfg.name);
                action.cfg.id = workCenter.id;
            }
        });
    }

    private static generateCreateActions_storageZone(departmentCfg: departmentCfg, storageZoneCfg: storageZoneCfg, actions: any[])
    {
        actions.push({
            actionName: "CreateStorageZone",
            cfg: storageZoneCfg,
            departmentCfg: departmentCfg,
            execute: async (client: dpa, action: any) => {
                const storageZone = await client.manageEnterpriseStructure_createStorageZone(action.departmentCfg.id, action.cfg.name, action.cfg.address);
                action.cfg.id = storageZone.id;
            }
        });
    }

    private static generateCreateActions_department(siteCfg: siteCfg, parentDepartmentCfg: departmentCfg | null, departmentCfg: departmentCfg, actions: any[])
    {
        actions.push({
            actionName: "CreateDepartment",
            cfg: departmentCfg,
            siteCfg: siteCfg,
            parentDepartmentCfg: parentDepartmentCfg,
            execute: async (client: dpa, action: any) => {
                const department = await client.manageEnterpriseStructure_createDepartment(action.siteCfg.id, action.parentDepartmentCfg?.id, action.cfg.name);
                action.cfg.id = department.id;
            }
        });
        if (departmentCfg.departments) {
            for (const subDepartmentCfg of departmentCfg.departments)
                this.generateCreateActions_department(siteCfg, departmentCfg, subDepartmentCfg, actions);
        }
        if (departmentCfg.workCenters) {
            for (const workCenterCfg of departmentCfg.workCenters)
                this.generateCreateActions_workCenter(departmentCfg, workCenterCfg, actions);
        }
        if (departmentCfg.storageZones) {
            for (const storageZoneCfg of departmentCfg.storageZones)
                this.generateCreateActions_storageZone(departmentCfg, storageZoneCfg, actions);
        }
    }

    private static generateCreateActions_site(enterpriseCfg: enterpriseCfg, siteCfg: siteCfg, actions: any[])
    {
        actions.push({
            actionName: "CreateSite",
            cfg: siteCfg,
            enterpriseCfg: enterpriseCfg,
            execute: async (client: dpa, action: any) => {
                const site = await client.manageEnterpriseStructure_createSite(action.enterpriseCfg.id, action.cfg.name);
                action.cfg.id = site.id;
            }
        });
        if (siteCfg.departments) {
            for (const departmentCfg of siteCfg.departments)
                this.generateCreateActions_department(siteCfg, null, departmentCfg, actions);
        }
    }

    private static generateCreateActions_enterprise(enterpriseCfg: enterpriseCfg, actions: any[])
    {
        actions.push({
            actionName: "CreateEnterprise",
            cfg: enterpriseCfg,
            execute: async (client: dpa, action: any) => {
                const enterprise = await client.manageEnterpriseStructure_createEnterprise(action.cfg.name);
                action.cfg.id = enterprise.id;
            }
        });
        if (enterpriseCfg.sites) {
            for (const siteCfg of enterpriseCfg.sites)
                this.generateCreateActions_site(enterpriseCfg, siteCfg, actions);
        }
    }
    
    private static generateUpdateActions_workCenters(departmentCfg: departmentCfg, workCentersCfg: workCenterCfg[] | undefined, existentWorkCentersCfg: any[], actions: any[])
    {
        for (const existentWorkCenterCfg of existentWorkCentersCfg) {
            const workCenterCfg = workCentersCfg?.find((item) => item.name == existentWorkCenterCfg.name);
            if (!workCenterCfg)
                this.generateRemoveActions_workCenter(existentWorkCenterCfg, actions);
        }

        if (workCentersCfg) {
            for (const workCenterCfg of workCentersCfg) {
                const existentWorkCenterCfg = existentWorkCentersCfg.find((item) => item.name == workCenterCfg.name);
                if (existentWorkCenterCfg)
                    workCenterCfg.id = existentWorkCenterCfg.id;
            }

            for (const workCenterCfg of workCentersCfg) {
                if (!workCenterCfg.id)
                    this.generateCreateActions_workCenter(departmentCfg, workCenterCfg, actions);
            }
        }
    }

    private static generateUpdateActions_storageZones(departmentCfg: departmentCfg, storageZonesCfg: storageZoneCfg[] | undefined, existentStorageZonesCfg: any[], actions: any[])
    {
        for (const existentStorageZoneCfg of existentStorageZonesCfg) {
            const storageZoneCfg = storageZonesCfg?.find((item) => item.name == existentStorageZoneCfg.name);
            if (!storageZoneCfg)
                this.generateRemoveActions_storageZone(existentStorageZoneCfg, actions);
        }

        if (storageZonesCfg) {
            for (const storageZoneCfg of storageZonesCfg) {
                const existentStorageZoneCfg = existentStorageZonesCfg.find((item) => item.name == storageZoneCfg.name);
                if (existentStorageZoneCfg)
                    storageZoneCfg.id = existentStorageZoneCfg.id;
            }

            for (const storageZoneCfg of storageZonesCfg) {
                if (!storageZoneCfg.id)
                    this.generateCreateActions_storageZone(departmentCfg, storageZoneCfg, actions);
            }
        }
    }

    private static generateUpdateActions_departments(siteCfg: any, parentDepartmentCfg: departmentCfg | null, departmentsCfg: departmentCfg[] | undefined, existentDepartmentsCfg: any[], actions: any[])
    {
        for (const existentDepartmentCfg of existentDepartmentsCfg) {
            const departmentCfg = departmentsCfg?.find((item) => item.name == existentDepartmentCfg.name);
            if (!departmentCfg)
                this.generateRemoveActions_department(existentDepartmentCfg, actions);
        }

        if (departmentsCfg) {
            for (const departmentCfg of departmentsCfg) {
                const existentDepartmentCfg = existentDepartmentsCfg.find((item) => item.name == departmentCfg.name);
                if (existentDepartmentCfg) {
                    departmentCfg.id = existentDepartmentCfg.id;
                    this.generateUpdateActions_departments(siteCfg, departmentCfg, departmentCfg.departments, existentDepartmentCfg.departments, actions);
                    this.generateUpdateActions_workCenters(departmentCfg, departmentCfg.workCenters, existentDepartmentCfg.workCenters, actions);
                    this.generateUpdateActions_storageZones(departmentCfg, departmentCfg.storageZones, existentDepartmentCfg.storageZones, actions);
                }
            }

            for (const departmentCfg of departmentsCfg) {
                if (!departmentCfg.id)
                    this.generateCreateActions_department(siteCfg, null, departmentCfg, actions);
            }
        }
    }

    private static generateUpdateActions_sites(enterpriseCfg: any, sitesCfg: siteCfg[] | undefined, existentSitesCfg: any[], actions: any[])
    {
        for (const existentSiteCfg of existentSitesCfg) {
            const siteCfg = sitesCfg?.find((item) => item.name == existentSiteCfg.name);
            if (!siteCfg)
                this.generateRemoveActions_site(existentSiteCfg, actions);
        }

        if (sitesCfg) {
            for (const siteCfg of sitesCfg) {
                const existentSiteCfg = existentSitesCfg.find((item) => item.name == siteCfg.name);
                if (existentSiteCfg) {
                    siteCfg.id = existentSiteCfg.id;
                    this.generateUpdateActions_departments(siteCfg, null, siteCfg.departments, existentSiteCfg.departments, actions);
                }
            }

            for (const siteCfg of sitesCfg) {
                if (!siteCfg.id)
                    this.generateCreateActions_site(enterpriseCfg, siteCfg, actions);
            }
        }
    }

    public static generateUpdateActions(enterpriseCfg: enterpriseCfg, existentCfg: any[]): any[]
    {
        let actions: any[] = [];

        for (const existentEnterpriseCfg of existentCfg) {
            if (enterpriseCfg.name != existentEnterpriseCfg.name)
                this.generateRemoveActions_enterprise(existentEnterpriseCfg, actions);
        }

        for (const existentEnterpriseCfg of existentCfg) {
            if (enterpriseCfg.name == existentEnterpriseCfg.name) {
                enterpriseCfg.id = existentEnterpriseCfg.id;
                this.generateUpdateActions_sites(enterpriseCfg, enterpriseCfg.sites, existentEnterpriseCfg.sites, actions);
            }
        }

        if (!enterpriseCfg.id)
            this.generateCreateActions_enterprise(enterpriseCfg, actions);
        
        return actions;
    }
}
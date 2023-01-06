import fs from "fs";
import { dpa, enterpriseStructTypes } from "./dpa.js";
import chalk from "chalk";
import { enterpriseStruct } from "./enterpriseStruct.js";

export class importEnterpriseStruct
{

    private static generateRemoveActions_workCenter(workCenterCfg: any, actions: any[])
    {
        actions.push({
            actionName: "RemoveWorkCenter",
            id: workCenterCfg.id,
            name: workCenterCfg.name,
            execute: (client: dpa, action: any) => {
                // param($action)
                // DPA-WorkCenter-remove $action.id
            }
        });
    }

    private static generateRemoveActions_storageZone(storageZoneCfg: any, actions: any[])
    {
        actions.push({
            actionName: "RemoveStorageZone",
            id: storageZoneCfg.id,
            name: storageZoneCfg.name,
            execute: (client: dpa) => {
                // param($action)
                // DPA-StorageZone-remove $action.id
            }
        });
    }

    private static generateRemoveActions_department(departmentCfg: any, actions: any[])
    {
        for (const subDepartmentCfg of departmentCfg.departments) this.generateRemoveActions_department(subDepartmentCfg,  actions);
        for (const workCenterCfg of departmentCfg.workCenters) this.generateRemoveActions_workCenter(workCenterCfg, actions);
        for (const storageZoneCfg of departmentCfg.storageZones) this.generateRemoveActions_storageZone(storageZoneCfg, actions);
        actions.push({
            actionName: "RemoveDepartment",
            id: departmentCfg.id,
            name: departmentCfg.name,
            execute: (client: dpa) => {
                // param($action)
                // DPA-Department-remove $action.id
            }
        });
    }

    private static generateRemoveActions_site(siteCfg: any, actions: any[])
    {
        for (const departmentCfg of siteCfg.departments) this.generateRemoveActions_department(departmentCfg,  actions);
        actions.push({
            actionName: "RemoveSite",
            id: siteCfg.id,
            name: siteCfg.name,
            execute: (client: dpa) => {
                // param($action)
                // DPA-Site-remove $action.id
            }
        });
    }

    private static generateRemoveActions_enterprise(enterpriseCfg: any, actions: any[])
    {
        for (const siteCfg of enterpriseCfg.sites) this.generateRemoveActions_site(siteCfg, actions);
        actions.push({
            actionName: "RemoveEnterprise",
            id: enterpriseCfg.id,
            name: enterpriseCfg.name,
            execute: (client: dpa) => {
                // param($action)
                // DPA-Enterprise-remove $action.id
            }
        });
    }

    private static generateCreateActions_workCenter(departmentCfg: any, workCenterCfg: any, actions: any[])
    {
        actions.push({
            actionName: "CreateWorkCenter",
            cfg: workCenterCfg,
            departmentCfg: departmentCfg,
            execute: (client: dpa) => {
                // param($action)
                // $workCenter = DPA-WorkCenter-create $action.departmentCfg.id $action.cfg.name
                // $action.cfg.id = $workCenter.id
            }
        });
    }

    private static generateCreateActions_storageZone(departmentCfg: any, storageZoneCfg: any, actions: any[])
    {
        actions.push({
            actionName: "CreateStorageZone",
            cfg: storageZoneCfg,
            departmentCfg: departmentCfg,
            execute: (client: dpa) => {
                // param($action)
                // $storageZone = DPA-StorageZone-create $action.departmentCfg.id $action.cfg.name $action.cfg.address
                // $action.cfg.id = $storageZone.id
            }
        });
    }

    private static generateCreateActions_department(siteCfg: any, parentDepartmentCfg: any, departmentCfg: any, actions: any[])
    {
        actions.push({
            actionName: "CreateDepartment",
            cfg: departmentCfg,
            siteCfg: siteCfg,
            parentDepartmentCfg: parentDepartmentCfg,
            execute: (client: dpa) => {
                // param($action)
                // $department = DPA-Department-create $action.siteCfg.id $action.parentDepartmentCfg.id $action.cfg.name
                // $action.cfg.id = $department.id
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

    private static generateCreateActions_site(enterpriseCfg: any, siteCfg: any, actions: any[])
    {
        actions.push({
            actionName: "CreateSite",
            cfg: siteCfg,
            enterpriseCfg: enterpriseCfg,
            execute: (client: dpa) => {
                // param($action)
                // $site = DPA-Site-create $action.enterpriseCfg.id $action.cfg.name
                // $action.cfg.id = $site.id
            }
        });
        if (siteCfg.departments) {
            for (const departmentCfg of siteCfg.departments)
                this.generateCreateActions_department(siteCfg, null, departmentCfg, actions);
        }
    }

    private static generateCreateActions_enterprise(enterpriseCfg: any, actions: any[])
    {
        actions.push({
            actionName: "CreateEnterprise",
            cfg: enterpriseCfg,
            execute: (client: dpa) => {
                // param($action)
                // $enterprise = DPA-Enterprise-create $action.cfg.name
                // $action.cfg.id = $enterprise.id
            }
        });
        if (enterpriseCfg.sites) {
            for (const siteCfg of enterpriseCfg.sites)
                this.generateCreateActions_site(enterpriseCfg, siteCfg, actions);
        }
    }
    
    private static generateUpdateActions_workCenters(departmentCfg: any, workCentersCfg: any[], existentWorkCentersCfg: any[], actions: any[])
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

    private static generateUpdateActions_storageZones(departmentCfg: any, storageZonesCfg: any[], existentStorageZonesCfg: any[], actions: any[])
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

    private static generateUpdateActions_departments(siteCfg: any, parentDepartmentCfg: any, departmentsCfg: any[], existentDepartmentsCfg: any[], actions: any[])
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

    private static generateUpdateActions_sites(enterpriseCfg: any, sitesCfg: any[], existentSitesCfg: any[], actions: any[])
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

    private static generateUpdateActions(enterpriseCfg: any, existentCfg: any[]): any[]
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

    private static dumpUpdateActions(actions: any[])
    {
        for (const action of actions) {
            if (action.actionName.startsWith("Remove"))
                console.log("  ", chalk.yellow(action.actionName + ":"), action.id, action.name);
            if (action.actionName.startsWith("Create"))
                console.log("  ", action.actionName + ":", action.cfg.name);
        }
    }

    private static readConfig(): any
    {
        const buffer = fs.readFileSync("./data/enterpriseStruct.json");
        return JSON.parse(buffer.toString());
    }

    static async run(client: dpa): Promise<void>
    {
        console.log("enterprise struct READ CONFIGURATION");
        const enterpriseCfg = this.readConfig();
        console.log("enterprise struct FETCH");
        const existentCfg = await enterpriseStruct.fetch(client);
        console.log("enterprise UPDATE ACTIONS");
        const updateActions = this.generateUpdateActions(enterpriseCfg, existentCfg);
        this.dumpUpdateActions(updateActions);
    }
}
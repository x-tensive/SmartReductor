import { dpa, enterpriseStructTypes } from "./dpa.js";
import chalk from "chalk";

export type dpaImportTarget = "enterpriseStruct" | "shiftTemplates" | "shifts";

export class dpaImport {
    private static enterpriseStruct_IsContainerType(typeId: number)
    {
        if (typeId == enterpriseStructTypes.enterprise) return true;
        if (typeId == enterpriseStructTypes.site) return true;
        if (typeId == enterpriseStructTypes.department) return true;
        if (typeId == enterpriseStructTypes.workCenterContainer) return true;
        if (typeId == enterpriseStructTypes.storageZoneContainer) return true;
        return false;
    }
    
    private static enterpriseStruct_IsVirtualContainerType(typeId: number)
    {
        if (typeId == enterpriseStructTypes.workCenterContainer) return true;
        if (typeId == enterpriseStructTypes.storageZoneContainer) return true;
        return false;
    }
    
    private static fetchEnterpriseStructNodeCfg(typeId: number, id: number, name: string, parentNodeCfg: any)
    {
        let nodeCfg: any = { id: id, name: name };

        if (typeId == enterpriseStructTypes.enterprise) {
            nodeCfg.sites = [];
            parentNodeCfg.enterprises.push(nodeCfg);
        }  

        if (typeId == enterpriseStructTypes.site) {
            nodeCfg.departments =[];
            parentNodeCfg.sites.push(nodeCfg);
        } 

        if (typeId == enterpriseStructTypes.department) {
            nodeCfg.departments = [];
            nodeCfg.workCenters = [];
            nodeCfg.storageZones = [];
            parentNodeCfg.departments.push(nodeCfg);
        }

        if (typeId == enterpriseStructTypes.workCenter) {
            parentNodeCfg.workCenters.push(nodeCfg);
        }

        if (typeId == enterpriseStructTypes.storageZone) {
            parentNodeCfg.storageZones.push(nodeCfg);
        }

        return nodeCfg;
    }

    private static async fetchEnterpriseStructureNodes(client: dpa, parentTypeId: number, parentId: number, nodeCfg: any): Promise<void>
    {
        const nodes = await client.manageEnterpriseStructure_getDynamicTree(parentTypeId, parentId);
        for (const node of nodes) {
            let currentNodeCfg = nodeCfg;
            const isVirtualContainer = this.enterpriseStruct_IsVirtualContainerType(node.type);
            if (!isVirtualContainer)
                currentNodeCfg = this.fetchEnterpriseStructNodeCfg(node.type, node.id, node.text, nodeCfg);
            const isContainer = this.enterpriseStruct_IsContainerType(node.type);
            if (isContainer) 
                await this.fetchEnterpriseStructureNodes(client, node.type, node.id, currentNodeCfg);
        };
    }

    private static async fetchEnterpriseStructure(client: dpa): Promise<any[]>
    {
        let existentCfgContainer = {
            enterprises: []
        };
        await this.fetchEnterpriseStructureNodes(client, 0, 0, existentCfgContainer);
        return existentCfgContainer.enterprises;
    }

    private static async importEnterpriseStructure(client: dpa): Promise<void>
    {
        console.log("enterprise struct FETCH");
        const existentCfg = await this.fetchEnterpriseStructure(client);
    }

    static async run(target: dpaImportTarget, client: dpa): Promise<void>
    {
        console.log(chalk.blueBright("IMPORT", target));
        if (target == "enterpriseStruct")
            return this.importEnterpriseStructure(client);
    }
}
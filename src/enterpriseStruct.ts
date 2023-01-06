import { dpa, enterpriseStructTypes } from "./dpa.js";

export class enterpriseStruct {
    private static isContainerType(typeId: number)
    {
        if (typeId == enterpriseStructTypes.enterprise) return true;
        if (typeId == enterpriseStructTypes.site) return true;
        if (typeId == enterpriseStructTypes.department) return true;
        if (typeId == enterpriseStructTypes.workCenterContainer) return true;
        if (typeId == enterpriseStructTypes.storageZoneContainer) return true;
        return false;
    }
    
    private static isVirtualContainerType(typeId: number)
    {
        if (typeId == enterpriseStructTypes.workCenterContainer) return true;
        if (typeId == enterpriseStructTypes.storageZoneContainer) return true;
        return false;
    }
    
    private static fetchNodeCfg(typeId: number, id: number, name: string, parentNodeCfg: any)
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

    private static async fetchNodes(client: dpa, parentTypeId: number, parentId: number, nodeCfg: any): Promise<void>
    {
        const nodes = await client.manageEnterpriseStructure_getDynamicTree(parentTypeId, parentId);
        for (const node of nodes) {
            let currentNodeCfg = nodeCfg;
            const isVirtualContainer = this.isVirtualContainerType(node.type);
            if (!isVirtualContainer)
                currentNodeCfg = this.fetchNodeCfg(node.type, node.id, node.text, nodeCfg);
            const isContainer = this.isContainerType(node.type);
            if (isContainer) 
                await this.fetchNodes(client, node.type, node.id, currentNodeCfg);
        };
    }

    public static async fetch(client: dpa): Promise<any[]>
    {
        let existentCfgContainer = {
            enterprises: []
        };
        await this.fetchNodes(client, 0, 0, existentCfgContainer);
        return existentCfgContainer.enterprises;
    }
}
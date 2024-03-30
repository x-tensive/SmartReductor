import { compare3DModels } from "../compare/compare3DModels.js";
import { dpa } from "../dpa.js";
import { threeDimensionalModels } from "../extract/3DModels.js";
import { smartReductorConfig } from "../smartReductorConfig.js";
import { importBase } from "./importBase.js";
import { importEnterpriseStruct } from "./importEnterpriseStruct.js";

export class import3DModels extends importBase
{
    static async prepareCfg(client: dpa): Promise<{ modelsCfg: threeDimensionalModelCfg[], updateActions: any[] }>
    {
        console.log("3D models READ CONFIGURATION");
        const modelsCfg = smartReductorConfig.read3DModelsConfiguration();

        console.log("3D models FETCH");
        const existentCfg = await threeDimensionalModels.fetch(client);

        console.log("3D models UPDATE ACTIONS");
        const updateActions = compare3DModels.generateUpdateActions(modelsCfg, existentCfg);

        return { modelsCfg: modelsCfg, updateActions: updateActions };
    }

    static async prepareAttachModelsUpdateActions_department(client: dpa, departmentCfg: departmentCfg, modelsCfg: threeDimensionalModelCfg[], updateActions: any[]): Promise<void>
    {
        if (departmentCfg.threeDModel) {
            const modelCfg = modelsCfg.find(cfg => cfg.name == departmentCfg.threeDModel);
            if (!modelCfg)
                throw "3D model \"" + departmentCfg.threeDModel + "\" is not found!";
            updateActions.push({
                actionName: "Attach3DModel",
                cfg: departmentCfg,
                model: modelCfg,
                execute: async (client: dpa, action: any) => {
                    await client.threeDimensionalModel_attachToDepartment(action.cfg.id, action.model.id, action.model.name);
                }
            });
        } else {
            updateActions.push({
                actionName: "Detach3DModel",
                cfg: departmentCfg,
                execute: async (client: dpa, action: any) => {
                    await client.threeDimensionalModel_detachFromDepartment(action.cfg.id);
                }
            });
        }
        
        if (departmentCfg.departments) {
            for (const subDepartmentCfg of departmentCfg.departments)
                await this.prepareAttachModelsUpdateActions_department(client, subDepartmentCfg, modelsCfg, updateActions);
        }

        if (departmentCfg.workCenters) {
            for (const workCenterCfg of departmentCfg.workCenters) {
                if (workCenterCfg.threeDModel) {
                    const modelCfg = modelsCfg.find(cfg => cfg.name == workCenterCfg.threeDModel);
                    if (!modelCfg)
                        throw "3D model \"" + workCenterCfg.threeDModel + "\" is not found!";
                    updateActions.push({
                        actionName: "Attach3DModel",
                        cfg: workCenterCfg,
                        model: modelCfg,
                        execute: async (client: dpa, action: any) => {
                            await client.threeDimensionalModel_attachToWorkCenter(action.cfg.id, action.model.id, action.model.name);
                        }
                    });
                } else {
                    updateActions.push({
                        actionName: "Detach3DModel",
                        cfg: workCenterCfg,
                        execute: async (client: dpa, action: any) => {
                            await client.threeDimensionalModel_detachFromWorkCenter(action.cfg.id);
                        }
                    });
                }
            }
        }
    }

    static async prepareAttachModelsUpdateActions_site(client: dpa, siteCfg: siteCfg, modelsCfg: threeDimensionalModelCfg[], updateActions: any[]): Promise<void>
    {
        if (siteCfg.departments) {
            for (const departmentCfg of siteCfg.departments) {
                await this.prepareAttachModelsUpdateActions_department(client, departmentCfg, modelsCfg, updateActions);
            }
        }
    }

    static async prepareAttachModelsUpdateActions(client: dpa, enterpriseCfg: enterpriseCfg, modelsCfg: threeDimensionalModelCfg[]): Promise<any[]>
    {
        console.log("attach 3D models UPDATE ACTIONS");
        let updateActions = new Array<any>;
        if (enterpriseCfg.sites) {
            for (const siteCfg of enterpriseCfg.sites)
                await this.prepareAttachModelsUpdateActions_site(client, siteCfg,  modelsCfg, updateActions);
        }

        return updateActions;
    }

    static async run(client: dpa): Promise<void>
    {
        const cfg = await this.prepareCfg(client);
        this.dumpUpdateActions(cfg.updateActions);

        console.log("3D models EXECUTE UPDATE ACTIONS");
        await this.executeUpdateActions(client, cfg.updateActions);

        const enterpriseStructCfg = await importEnterpriseStruct.prepareCfg(client);
        if (enterpriseStructCfg.updateActions.length)
            throw "enterprise struct update required!";

        const attachModelsUpdateActions = await this.prepareAttachModelsUpdateActions(client, enterpriseStructCfg.enterpriseCfg, cfg.modelsCfg);
        this.dumpUpdateActions(attachModelsUpdateActions);

        console.log("attach 3D models EXECUTE UPDATE ACTIONS");
        await this.executeUpdateActions(client, attachModelsUpdateActions);
    }
}
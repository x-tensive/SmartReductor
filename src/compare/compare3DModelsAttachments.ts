import { dpa } from "../dpa";

export class compare3DModelsAttachments
{
    static async generateUpdateActions_department(departmentCfg: departmentCfg, modelsCfg: threeDimensionalModelCfg[], actions: any[]): Promise<void>
    {
        if (departmentCfg.threeDModel) {
            const modelCfg = modelsCfg.find(cfg => cfg.name == departmentCfg.threeDModel);
            if (!modelCfg)
                throw "3D model \"" + departmentCfg.threeDModel + "\" is not found!";
            actions.push({
                actionName: "Attach3DModel",
                cfg: departmentCfg,
                model: modelCfg,
                execute: async (client: dpa, action: any) => {
                    await client.threeDimensionalModel_attachToDepartment(action.cfg.id, action.model.id, action.model.name);
                }
            });
        } else {
            actions.push({
                actionName: "Detach3DModel",
                cfg: departmentCfg,
                execute: async (client: dpa, action: any) => {
                    await client.threeDimensionalModel_detachFromDepartment(action.cfg.id);
                }
            });
        }
        
        if (departmentCfg.departments) {
            for (const subDepartmentCfg of departmentCfg.departments)
                await this.generateUpdateActions_department(subDepartmentCfg, modelsCfg, actions);
        }

        if (departmentCfg.workCenters) {
            for (const workCenterCfg of departmentCfg.workCenters) {
                if (workCenterCfg.threeDModel) {
                    const modelCfg = modelsCfg.find(cfg => cfg.name == workCenterCfg.threeDModel);
                    if (!modelCfg)
                        throw "3D model \"" + workCenterCfg.threeDModel + "\" is not found!";
                    actions.push({
                        actionName: "Attach3DModel",
                        cfg: workCenterCfg,
                        model: modelCfg,
                        execute: async (client: dpa, action: any) => {
                            await client.threeDimensionalModel_attachToWorkCenter(action.cfg.id, action.model.id, action.model.name);
                        }
                    });
                } else {
                    actions.push({
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

    static async generateUpdateActions_site(siteCfg: siteCfg, modelsCfg: threeDimensionalModelCfg[], actions: any[]): Promise<void>
    {
        if (siteCfg.departments) {
            for (const departmentCfg of siteCfg.departments) {
                await this.generateUpdateActions_department(departmentCfg, modelsCfg, actions);
            }
        }
    }

    public static async generateUpdateActions(enterpriseCfg: enterpriseCfg, modelsCfg: threeDimensionalModelCfg[]): Promise<any[]>
    {
        let actions: any[] = [];

        if (enterpriseCfg.sites) {
            for (const siteCfg of enterpriseCfg.sites)
                await this.generateUpdateActions_site(siteCfg,  modelsCfg, actions);
        }
        
        return actions;
    }
}
import { dpa } from "../dpa";

export class compareEnterpriseStructAvailableReasons
{
    private static getTargetReasons(targetCfg: any, reasons: any[]): any[]
    {
        if (targetCfg == "all")
            return reasons;
        return targetCfg.map((name: string) => reasons.find((item: any) => item.name == name));
    }

    private static areSameReasons(reasons1: any[], reasons2: any[]): boolean
    {
        for (const reason of reasons1) {
            if (!reasons2.find((item: any) => item.name == reason.name))
                return false;
        }
        for (const reason of reasons2) {
            if (!reasons1.find((item: any) => item.name == reason.name))
                return false;
        }
        return true;
    }

    private static async generateUpdateActions_configurationType(client: dpa, type: number, cfg: availableReasonsOwnerCfg, reasonType: number, allowInherit: boolean, targetCfg: any, reasons: any[], actions: any[]): Promise<void>
    {
        const inherit = targetCfg == "inherit" || !targetCfg;
        if (inherit && !allowInherit)
            throw "inheritance is not allowed";
        
        const currentCfg = await client.availableReason_getAllReasons(type, cfg.id!, reasonType);
        
        if (inherit) {
            if (!currentCfg.useParentReasons) {
                actions.push({
                    actionName: "UpdateAttachToParent",
                    cfg: cfg,
                    execute: async (client: dpa, action: any) => {
                        await client.availableReason_attachReasonsToParent(type, action.cfg.id, reasonType);
                    }
                });
            }
            return;
        }

        if (currentCfg.useParentReasons) {
            actions.push({
                actionName: "UpdateDetachFromParent",
                cfg: cfg,
                execute: async (client: dpa, action: any) => {
                    await client.availableReason_detachReasonsFromParent(type, action.cfg.id, reasonType);
                }
            });
        }

        const targetReasons = this.getTargetReasons(targetCfg, reasons);
        const currentReasons = currentCfg.reasons
            .filter((item: any) => item.isEnabled)
            .map((item: any) => ({ name: item.reasonName }));
        if (this.areSameReasons(targetReasons, currentReasons))
            return;
        
        actions.push({
            actionName: "UpdateAvailableReasons",
            cfg: cfg,
            reasonIds: targetReasons.map((item: any) => item.id),
            execute: async (client: dpa, action: any) => {
                await client.availableReason_updateAvailableReasons(type, action.cfg.id, reasonType, action.reasonIds);
            }
        });
    }
    
    private static async generateUpdateActions_configuration(client: dpa, type: number, cfg: availableReasonsOwnerCfg, allowInherit: boolean, downtimeReasons: any[], operationRunSuspendReasons: any[], overtimeReasons: any[], underproductionReasons: any[], actions: any[]): Promise<void>
    {
        await this.generateUpdateActions_configurationType(client, type, cfg, 1, allowInherit, cfg.availableDowntimeReasons, downtimeReasons, actions);
        await this.generateUpdateActions_configurationType(client, type, cfg, 3, allowInherit, cfg.availableOperationRunSuspendReasons, operationRunSuspendReasons, actions);
        await this.generateUpdateActions_configurationType(client, type, cfg, 2, allowInherit, cfg.availableOvertimeReasons, overtimeReasons, actions);
        await this.generateUpdateActions_configurationType(client, type, cfg, 4, allowInherit, cfg.availableUnderproductionReasons, underproductionReasons, actions);
    }

    private static async generateUpdateActions_workCenter(client: dpa, workCenterCfg: workCenterCfg, downtimeReasons: any[], operationRunSuspendReasons: any[], overtimeReasons: any[], underproductionReasons: any[], actions: any[]): Promise<void>
    {
        return this.generateUpdateActions_configuration(client, 4, workCenterCfg, true, downtimeReasons, operationRunSuspendReasons, overtimeReasons, underproductionReasons, actions);
    }

    private static async generateUpdateActions_department(client: dpa, departmentCfg: departmentCfg, downtimeReasons: any[], operationRunSuspendReasons: any[], overtimeReasons: any[], underproductionReasons: any[], actions: any[]): Promise<void>
    {
        await this.generateUpdateActions_configuration(client, 3, departmentCfg, true, downtimeReasons, operationRunSuspendReasons, overtimeReasons, underproductionReasons, actions);

        if (departmentCfg.departments) {
            for (const subDepartmentCfg of departmentCfg.departments)
                await this.generateUpdateActions_department(client, subDepartmentCfg, downtimeReasons, operationRunSuspendReasons, overtimeReasons, underproductionReasons, actions);
        }
        if (departmentCfg.workCenters) {
            for (const workCenterCfg of departmentCfg.workCenters)
                await this.generateUpdateActions_workCenter(client, workCenterCfg, downtimeReasons, operationRunSuspendReasons, overtimeReasons, underproductionReasons, actions);
        }
    }

    private static async generateUpdateActions_site(client: dpa, siteCfg: siteCfg, downtimeReasons: any[], operationRunSuspendReasons: any[], overtimeReasons: any[], underproductionReasons: any[], actions: any[]): Promise<void>
    {
        await this.generateUpdateActions_configuration(client, 2, siteCfg, true, downtimeReasons, operationRunSuspendReasons, overtimeReasons, underproductionReasons, actions);
        
        if (siteCfg.departments) {
            for (const departmentCfg of siteCfg.departments)
                await this.generateUpdateActions_department(client, departmentCfg, downtimeReasons, operationRunSuspendReasons, overtimeReasons, underproductionReasons, actions);
        }
    }

    public static async generateUpdateActions(client: dpa, enterpriseCfg: enterpriseCfg, downtimeReasons: any[], operationRunSuspendReasons: any[], overtimeReasons: any[], underproductionReasons: any[]): Promise<any[]>
    {
        let actions: any[] = [];

        await this.generateUpdateActions_configuration(client, 1, enterpriseCfg, false, downtimeReasons, operationRunSuspendReasons, overtimeReasons, underproductionReasons, actions);
        
        if (enterpriseCfg.sites) {
            for (const siteCfg of enterpriseCfg.sites)
                await this.generateUpdateActions_site(client, siteCfg, downtimeReasons, operationRunSuspendReasons, overtimeReasons, underproductionReasons, actions);
        }

        return actions;
    }
}
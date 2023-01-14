import { dpa } from "../dpa";

export class compareWorkCenterProps
{
    private static get_model = (workCenterCfg: workCenterCfg): string => workCenterCfg.model ?? "";
    
    private static get_inventoryNumber = (workCenterCfg: workCenterCfg): string => workCenterCfg.inventoryNumber ?? "";
    
    private static get_description = (workCenterCfg: workCenterCfg): string => workCenterCfg.description ?? "";
    
    private static get_groups = (workCenterCfg: workCenterCfg, workCenterGroupsCfg: workCenterGroupCfg[]): number[] => {
        return workCenterCfg.groups ?
            workCenterCfg.groups.map((name) => workCenterGroupsCfg.find((g) => g.name == name)!.id!) :
            [];
    }
    
    private static get_counterType = (workCenterCfg: workCenterCfg): number => {
        if (typeof workCenterCfg.counterType == "undefined")
            return 0;
        if (workCenterCfg.counterType == "CP")
            return 0;
        if (workCenterCfg.counterType == "counter")
            return 1;
        if (workCenterCfg.counterType == "none")
            return 2;
        throw "specified counter type is not supported";
    }

    private static get_counterIncrementType = (workCenterCfg: workCenterCfg): number => {
        if (typeof workCenterCfg.counterIncrementType == "undefined")
            return 0;
        if (workCenterCfg.counterIncrementType == "diff")
            return 0;
        if (workCenterCfg.counterIncrementType == "change")
            return 1;
        throw "specified counter increment type is not supported";
    }
    
    private static get_counterDiscreteness = (workCenterCfg: workCenterCfg): number => {
        if (typeof workCenterCfg.counterDiscreteness == "undefined")
            return 1;
        return workCenterCfg.counterDiscreteness;
    }

    private static get_normativeDiscreteness = (workCenterCfg: workCenterCfg): number => {
        if (typeof workCenterCfg.normativeDiscreteness == "undefined")
            return 1;
        return workCenterCfg.normativeDiscreteness;
    }

    private static get_qualityMark = (workCenterCfg: workCenterCfg): number => {
        if (typeof workCenterCfg.qualityMark == "undefined")
            return 0;
        if (workCenterCfg.qualityMark == "conditionalGood")
            return 0;
        if (workCenterCfg.qualityMark == "good")
            return 1;
        if (workCenterCfg.qualityMark == "bad")
            return 2;
        throw "specified quality mark is not supported";
    }

    private static get_masterMustComfirmIncompleteJobClose = (workCenterCfg: workCenterCfg): boolean => workCenterCfg.masterMustComfirmIncompleteJobClose ?? false;
    
    private static get_masterMustComfirmDisorderJobStar = (workCenterCfg: workCenterCfg): boolean => workCenterCfg.masterMustComfirmDisorderJobStar ?? false;

    private static get_allowMultipleJobsRun = (workCenterCfg: workCenterCfg): boolean => workCenterCfg.allowMultipleJobsRun ?? false;

    private static get_forbidJobStartWhenAnotherJobIsSuspended = (workCenterCfg: workCenterCfg): boolean => workCenterCfg.forbidJobStartWhenAnotherJobIsSuspended ?? false;

    private static get_allowMultiplePersonalShifts = (workCenterCfg: workCenterCfg): boolean => workCenterCfg.allowMultiplePersonalShifts ?? false;

    private static get_useMachineStatisticsOutput = (workCenterCfg: workCenterCfg): boolean => workCenterCfg.useMachineStatisticsOutput ?? false;
    
    private static get_parseCP = (workCenterCfg: workCenterCfg): number => {
        if (typeof workCenterCfg.parseCP == "undefined")
            return 0;
        if (workCenterCfg.parseCP == "none")
            return 0;
        if (workCenterCfg.parseCP == "name")
            return 1;
        if (workCenterCfg.parseCP == "tags")
            return 2;
        throw "specified parse CP is not supported";
    }

    private static get_parseCPsystemName = (workCenterCfg: workCenterCfg): number => {
        if (typeof workCenterCfg.parseCPsystemName == "undefined")
            return 0;
        if (workCenterCfg.parseCPsystemName == "disabled")
            return 0;
        if (workCenterCfg.parseCPsystemName == "fanuc1")
            return 1;
        if (workCenterCfg.parseCPsystemName == "fanuc2")
            return 2;
        throw "specified parse CP system name is not supported";
    }

    private static cmpGroups(group1: number[], group2: number[]): boolean
    {
        for (const group of group1) {
            if (!group2.find((item: number) => item == group))
                return false;
        }
        for (const group of group2) {
            if (!group1.find((item: number) => item == group))
                return false;
        }
        return true;
    }

    private static isChanged(workCenterCfg: workCenterCfg, workCenter: any, workCenterGroupsCfg: workCenterGroupCfg[]): boolean
    {
        if (this.get_model(workCenterCfg) != workCenter.model) return true;
        if (this.get_inventoryNumber(workCenterCfg) != workCenter.inventoryNumber) return true;
        if (this.get_description(workCenterCfg) != workCenter.description) return true;
        if (!this.cmpGroups(this.get_groups(workCenterCfg, workCenterGroupsCfg), workCenter.equipmentGroupIds)) return true;
        if (this.get_counterType(workCenterCfg) != workCenter.releaseCountingType) return true;
        if (this.get_counterIncrementType(workCenterCfg) != workCenter.counterIncrementType) return true;
        if (this.get_counterDiscreteness(workCenterCfg) != workCenter.releaseDiscreteness) return true;
        if (this.get_normativeDiscreteness(workCenterCfg) != workCenter.normativeReleaseDiscreteness) return true;
        if (this.get_qualityMark(workCenterCfg) != workCenter.releaseQualityMark) return true;
        if (this.get_masterMustComfirmIncompleteJobClose(workCenterCfg) != workCenter.masterMustComfirmIncompleteJobClose) return true;
        if (this.get_masterMustComfirmDisorderJobStar(workCenterCfg) != workCenter.masterMustComfirmDisorderedJobStart) return true;
        if (this.get_allowMultipleJobsRun(workCenterCfg) != workCenter.allowMultipleTasksSimultaneously) return true;
        if (this.get_forbidJobStartWhenAnotherJobIsSuspended(workCenterCfg) != workCenter.prohibitedJobStartWhenAnotherJobIsSuspended) return true;
        if (this.get_allowMultiplePersonalShifts(workCenterCfg) != workCenter.allowMultiplePersonalShifts) return true;
        if (this.get_useMachineStatisticsOutput(workCenterCfg) != workCenter.useMachineStatisticsOutput) return true;
        if (this.get_parseCP(workCenterCfg) != workCenter.parseNcDataType) return true;
        if (this.get_parseCPsystemName(workCenterCfg) != workCenter.ncSystemNameFormatType) return true;
        return false;
    }

    private static updateProps(workCenterCfg: workCenterCfg, workCenter: any, workCenterGroupsCfg: workCenterGroupCfg[]): void
    {
        workCenter.model = this.get_model(workCenterCfg);
        workCenter.inventoryNumber = this.get_inventoryNumber(workCenterCfg);
        workCenter.description = this.get_description(workCenterCfg);
        workCenter.equipmentGroupIds = this.get_groups(workCenterCfg, workCenterGroupsCfg);
        workCenter.releaseCountingType = this.get_counterType(workCenterCfg);
        workCenter.counterIncrementType = this.get_counterIncrementType(workCenterCfg);
        workCenter.releaseDiscreteness = this.get_counterDiscreteness(workCenterCfg);
        workCenter.normativeReleaseDiscreteness = this.get_normativeDiscreteness(workCenterCfg);
        workCenter.releaseQualityMark = this.get_qualityMark(workCenterCfg);
        workCenter.masterMustComfirmIncompleteJobClose = this.get_masterMustComfirmIncompleteJobClose(workCenterCfg);
        workCenter.masterMustComfirmDisorderedJobStart = this.get_masterMustComfirmDisorderJobStar(workCenterCfg);
        workCenter.allowMultipleTasksSimultaneously = this.get_allowMultipleJobsRun(workCenterCfg);
        workCenter.prohibitedJobStartWhenAnotherJobIsSuspended = this.get_forbidJobStartWhenAnotherJobIsSuspended(workCenterCfg);
        workCenter.allowMultiplePersonalShifts = this.get_allowMultiplePersonalShifts(workCenterCfg);
        workCenter.useMachineStatisticsOutput = this.get_useMachineStatisticsOutput(workCenterCfg);
        workCenter.parseNcDataType = this.get_parseCP(workCenterCfg);
        workCenter.ncSystemNameFormatType = this.get_parseCPsystemName(workCenterCfg);
    }

    private static async generateUpdateActions_workCenter(client: dpa, workCenterCfg: workCenterCfg, workCenterGroupsCfg: workCenterGroupCfg[], actions: any[]): Promise<void>
    {
        const workCenter = await client.manageEnterpriseStructure_getWorkCenter(workCenterCfg.id!);
        if (this.isChanged(workCenterCfg, workCenter, workCenterGroupsCfg)) {
            this.updateProps(workCenterCfg, workCenter, workCenterGroupsCfg);
            actions.push({
                actionName: "UpdateWorkCenterProps",
                cfg: workCenter,
                execute: async (client: dpa, action: any) => {
                    await client.manageEnterpriseStructure_updateWorkCenter(action.cfg);
                }
            });
        }
    }

    private static async generateUpdateActions_department(client: dpa, departmentCfg: departmentCfg, workCenterGroupsCfg: workCenterGroupCfg[], actions: any[]): Promise<void>
    {
        if (departmentCfg.departments) {
            for (const subDepartmentCfg of departmentCfg.departments)
                await this.generateUpdateActions_department(client, subDepartmentCfg, workCenterGroupsCfg, actions);
        }
        if (departmentCfg.workCenters) {
            for (const workCenterCfg of departmentCfg.workCenters)
                await this.generateUpdateActions_workCenter(client, workCenterCfg, workCenterGroupsCfg, actions);
        }
    }

    private static async generateUpdateActions_site(client: dpa, siteCfg: siteCfg, workCenterGroupsCfg: workCenterGroupCfg[], actions: any[]): Promise<void>
    {
        if (siteCfg.departments) {
            for (const departmentCfg of siteCfg.departments)
                await this.generateUpdateActions_department(client, departmentCfg, workCenterGroupsCfg, actions);
        }
    }
    public static async generateUpdateActions(client: dpa, enterpriseCfg: enterpriseCfg, workCenterGroupsCfg: workCenterGroupCfg[]): Promise<any[]>
    {
        let actions: any[] = [];

        if (enterpriseCfg.sites) {
            for (const siteCfg of enterpriseCfg.sites)
                await this.generateUpdateActions_site(client, siteCfg, workCenterGroupsCfg, actions);
        }

        return actions;
    }
}
import fs from "fs";
import { dpa } from "./dpa.js";

export class smartReductorConfig
{
    public static readEnterpriseStructConfig(): enterpriseCfg
    {
        const buffer = fs.readFileSync("./data/enterpriseStruct.json");
        return JSON.parse(buffer.toString());
    }

    public static readShiftsConfiguration(): shiftCfg[]
    {
        const buffer = fs.readFileSync("./data/shifts.json");
        return JSON.parse(buffer.toString());
    }

    public static readShiftTemplatesConfiguration(): shiftTemplateCfg[]
    {
        const buffer = fs.readFileSync("./data/shiftTemplates.json");
        return JSON.parse(buffer.toString());
    }

    public static readDowntimeReasonTypesConfiguration(): downtimeReasonTypeCfg[]
    {
        const buffer = fs.readFileSync("./data/downtimeReasonTypes.json");
        return JSON.parse(buffer.toString());
    }

    public static readDowntimeReasonsConfiguration(): downtimeReasonCfg[]
    {
        const buffer = fs.readFileSync("./data/downtimeReasons.json");
        return JSON.parse(buffer.toString());
    }

    public static readOperationRunSuspendReasonsConfiguration(): operationRunSuspendReasonCfg[]
    {
        const buffer = fs.readFileSync("./data/operationRunSuspendReasons.json");
        return JSON.parse(buffer.toString());
    }

    public static readOvertimeReasonsConfiguration(): overtimeReasonCfg[]
    {
        const buffer = fs.readFileSync("./data/overtimeReasons.json");
        return JSON.parse(buffer.toString());
    }

    public static readUnderproductionReasonsConfiguration(): underproductionReasonCfg[]
    {
        const buffer = fs.readFileSync("./data/underproductionReasons.json");
        return JSON.parse(buffer.toString());
    }

    public static readSettingsConfiguration(): settingGroupCfg[]
    {
        const buffer = fs.readFileSync("./data/settings.json");
        return JSON.parse(buffer.toString());
    }

    public static readWorkCenterGroupsConfiguration(): workCenterGroupCfg[]
    {
        const buffer = fs.readFileSync("./data/workCenterGroups.json");
        return JSON.parse(buffer.toString());
    }

    public static read3DModelsConfiguration(): threeDimensionalModelCfg[]
    {
        const buffer = fs.readFileSync("./data/3DModels.json");
        let models: threeDimensionalModelCfg[] = JSON.parse(buffer.toString());
        for (let model of models)
            model.data = fs.readFileSync("./data/3D/" + model.fileName).toString("base64");
        return models;
    }

    public static readDashboardsConfiguration(): any[]
    {
        const files = fs.readdirSync("./data/dashboards").filter(fn => fn.endsWith(".json"));
        const dashboards = files.map(f => {
            const buffer = fs.readFileSync("./data/dashboards/" + f);
            return JSON.parse(buffer.toString());
        })
        return dashboards;
    }

    public static readDriversConfiguration(): driverCfg[]
    {
        const buffer = fs.readFileSync("./data/drivers.json");
        return JSON.parse(buffer.toString());
    }

    public static async readDriverLinksConfiguration(client: dpa, enterprise: enterpriseCfg, drivers: driverCfg[]): Promise<driverLinkCfg[]>
    {
        let result = new Array<driverLinkCfg>();

        const readFromDepartment = async (department: departmentCfg) => {
            if (department.departments) {
                for (const subDepartment of department.departments) {
                    readFromDepartment(subDepartment);
                }
            }
            if (department.workCenters) {
                for (const workCenter of department.workCenters) {
                    if (!workCenter.id)
                        throw "workcenter id!";
                    const driver = drivers.find((item) => item.serverName + "/" + item.name == workCenter.driver);
                    result.push({
                        workCenterId: workCenter.id,
                        workCenterName: workCenter.name,
                        driverIdentifier: driver?.driverConfigurationInfo.identifier,
                        driverInfo: workCenter.driver!,
                        driverCfg_fileName: driver?.cfg_fileName
                    });
                }
            }
        };

        if (enterprise && enterprise.sites) {
            for (const site of enterprise.sites) {
                if (site.departments) {
                    for (const department of site.departments) {
                        await readFromDepartment(department);
                    }
                }
            }
        }

        return result;
    }
}
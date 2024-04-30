import { dpa } from "../dpa.js";
import { importEnterpriseStruct } from "../import/importEnterpriseStruct.js";

export class driverLinks
{
    public static async fetch(client: dpa, enterprise: enterpriseCfg): Promise<driverLinkCfg[]>
    {
        let result = new Array<driverLinkCfg>();

        const fetchFromDepartment = async (department: departmentCfg) => {
            if (department.departments) {
                for (const subDepartment of department.departments) {
                    await fetchFromDepartment(subDepartment);
                }
            }
            if (department.workCenters) {
                for (const workCenter of department.workCenters) {
                    if (!workCenter.id)
                        throw "workcenter id!";
                    const workCenterInfo = await client.manageEnterpriseStructure_getWorkCenter(workCenter.id);
                    result.push({
                        workCenterId: workCenterInfo.id,
                        workCenterName: workCenterInfo.name,
                        driverIdentifier: workCenterInfo.driverIdentifier,
                        driverInfo: workCenterInfo.driverinfo
                    });
                }
            }
        };

        if (enterprise && enterprise.sites) {
            for (const site of enterprise.sites) {
                if (site.departments) {
                    for (const department of site.departments) {
                        await fetchFromDepartment(department);
                    }
                }
            }
        }

        return result;
    }

    public static async fetch_clean(client: dpa): Promise<driverLinkCfg[]>
    {
        const enterpriseStructCfg = await importEnterpriseStruct.prepareCfg(client);
        if (enterpriseStructCfg.updateActions.length)
            throw "enterprise struct update required!";

        return await this.fetch(client, enterpriseStructCfg.enterpriseCfg);
    }
}
import { dpa } from "../dpa";

export class compareDashboards
{
    public static async generateUpdateActions(client: dpa, dashboardsCfg: any[], existentCfg: any[]): Promise<any[]>
    {
        let actions: any[] = [];

        for (const existentDashboardCfg of existentCfg) {
            const dashboardCfg = dashboardsCfg.find((item: any) => item.name == existentDashboardCfg.name);
            if (!dashboardCfg) {
                actions.push({
                    actionName: "RemoveDashboard",
                    id: existentDashboardCfg.id,
                    name: existentDashboardCfg.name,
                    execute: async (client: dpa, action: any) => {
                        await client.dashboards_remove(action.id);
                    }
                });
            }
        }
    
        for (const dashboardCfg of dashboardsCfg) {
            const existentDashboardCfg = existentCfg.find((item: any) => item.name == dashboardCfg.name);
            if (existentDashboardCfg) {
                dashboardCfg.id = existentDashboardCfg.id;
                actions.push({
                    actionName: "UpdateDashboard",
                    id: existentDashboardCfg.id,
                    cfg: dashboardCfg,
                    execute: async (client: dpa, action: any) => {
                        await client.dashboards_update(action.id, action.cfg);
                    }
                });
            } else {
                actions.push({
                    actionName: "CreateDashboard",
                    cfg: dashboardCfg,
                    execute: async (client: dpa, action: any) => {
                        const dashboardId = await client.dashboards_create(action.cfg);
                        action.cfg.id = dashboardId;
                    }
                });
            }
        }

        return actions;
    }
}
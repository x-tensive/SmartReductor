import { dpa } from "../dpa";

export class compareSettings
{
    private static generateUpdateActions_setting(settingCfg: settingCfg, existentSetting: any, actions: any[])
    {
        settingCfg.sid = existentSetting.sid;
        settingCfg.type = existentSetting.type;
        if (settingCfg.value != existentSetting.value) {
            actions.push({
                actionName: "UpdateSettings",
                cfg: settingCfg,
                execute: async (client: dpa, action: any) => {
                    await client.settings_saveSettings([ { sid: action.cfg.sid, type: action.cfg.type, value: action.cfg.value } ]);
                }
            });
        }
    }

    private static generateUpdateActions_group(groupCfg: settingGroupCfg, existentGroup: any, actions: any[])
    {
        if (groupCfg.groups) {
            for (const subGroupCfg of groupCfg.groups) {
                const existentSubGroup = existentGroup.groups.find((item: any) => item.name == subGroupCfg.name);
                this.generateUpdateActions_group(subGroupCfg, existentSubGroup, actions);
            }
        }

        if (groupCfg.settings) {
            for (const settingCfg of groupCfg.settings) {
                const existentSetting = existentGroup.settings.find((item: any) => item.name == settingCfg.name);
                this.generateUpdateActions_setting(settingCfg, existentSetting, actions);
            }
        }
    }

    public static generateUpdateActions(settingsCfg: settingGroupCfg[], existentCfg: any[]): any[]
    {
        let actions: any[] = [];

        for (const groupCfg of settingsCfg) {
            const existentGroup = existentCfg.find((item) => item.name == groupCfg.name);
            this.generateUpdateActions_group(groupCfg, existentGroup, actions);
        }

        return actions;
    }
}
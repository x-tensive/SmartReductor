import { compareSettings } from "../compare/compareSettings.js";
import { dpa } from "../dpa.js";
import { settings } from "../extract/settings.js";
import { smartReductorConfig } from "../smartReductorConfig.js";
import { importBase } from "./importBase.js";

export class importSettings extends importBase
{
    static async prepareCfg(client: dpa): Promise<{ settingsCfg: any, updateActions: any[] }>
    {
        console.log("settings READ CONFIGURATION");
        const settingsCfg = smartReductorConfig.readSettingsConfiguration();

        console.log("settings FETCH");
        const existentCfg = await settings.fetch(client);

        console.log("settings UPDATE ACTIONS");
        const updateActions = compareSettings.generateUpdateActions(settingsCfg, existentCfg);

        return { settingsCfg: settingsCfg, updateActions: updateActions };
    }

    static async run(client: dpa): Promise<void>
    {
        const cfg = await this.prepareCfg(client);
        this.dumpUpdateActions(cfg.updateActions);

        console.log("settings EXECUTE UPDATE ACTIONS");
        await this.executeUpdateActions(client, cfg.updateActions);
    }
}
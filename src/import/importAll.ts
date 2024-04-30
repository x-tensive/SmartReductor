import { compareEnterpriseStructAvailableReasons } from "../compare/compareEnterpriseStructAvailableReasons.js";
import { compareShiftSchedule } from "../compare/compareShiftSchedule.js";
import { compareShiftTemplates } from "../compare/compareShiftTemplates.js";
import { compareWorkCenterProps } from "../compare/compareWorkCenterProps.js";
import { dpa } from "../dpa.js";
import { shiftTemplates } from "../extract/shiftTemplates.js";
import { smartReductorConfig } from "../smartReductorConfig.js";
import { importBase } from "./importBase.js";
import { importDowntimeReasons } from "./importDowntimeReasons.js";
import { importEnterpriseStruct } from "./importEnterpriseStruct.js";
import { importOperationRunSuspendReasons } from "./importOperationRunSuspendReasons.js";
import { importOvertimeReasons } from "./importOvertimeReasons.js";
import { importSettings } from "./importSettings.js";
import { importShifts } from "./importShifts.js";
import { importUnderproductionReasons } from "./importUnderproductionReasons.js";
import { importWorkCenterGroups } from "./importWorkCenterGroups.js";
import { import3DModels } from "./import3DModels.js";
import { import3DModelsAttachments } from "./import3DModelsAttachments.js";
import { importDashboards } from "./importDashboards.js";
import { importDrivers } from "./importDrivers.js";

export class importAll extends importBase
{
    static async run(client: dpa): Promise<void>
    {
        // settings

        const importSettingsCfg = await importSettings.prepareCfg(client);
        this.dumpUpdateActions(importSettingsCfg.updateActions);

        console.log("settings EXECUTE UPDATE ACTIONS");
        await this.executeUpdateActions(client, importSettingsCfg.updateActions);

        // enterprise struct

        const enterpriseStructImportCfg = await importEnterpriseStruct.prepareCfg(client);
        this.dumpUpdateActions(enterpriseStructImportCfg.updateActions);

        console.log("enterprise struct EXECUTE UPDATE ACTIONS");
        await this.executeUpdateActions(client, enterpriseStructImportCfg.updateActions);

        // shifts

        const shiftsImportCfg = await importShifts.prepareCfg(client);
        this.dumpUpdateActions(shiftsImportCfg.updateActions);

        console.log("shifts EXECUTE UPDATE ACTIONS");
        await this.executeUpdateActions(client, shiftsImportCfg.updateActions);

        // shift templates

        console.log("shift templates READ CONFIGURATION");
        const shiftTemplatesCfg = smartReductorConfig.readShiftTemplatesConfiguration();

        console.log("shift templates FETCH");
        const shiftTemplatesExistentCfg = await shiftTemplates.fetch(client);

        console.log("shift templates UPDATE ACTIONS");
        const shiftTemplateUpdateActions = await compareShiftTemplates.generateUpdateActions(client, shiftsImportCfg.shiftsCfg, shiftTemplatesCfg, shiftTemplatesExistentCfg);
        this.dumpUpdateActions(shiftTemplateUpdateActions);

        console.log("shift templates EXECUTE UPDATE ACTIONS");
        await this.executeUpdateActions(client, shiftTemplateUpdateActions);

        // shift schedule

        console.log("shift schedule UPDATE ACTIONS");
        const shiftScheduleUpdateActions = await compareShiftSchedule.generateUpdateActions(client, shiftTemplatesCfg, enterpriseStructImportCfg.enterpriseCfg);
        this.dumpUpdateActions(shiftScheduleUpdateActions);

        console.log("shift schedule EXECUTE UPDATE ACTIONS");
        await this.executeUpdateActions(client, shiftScheduleUpdateActions);

        // downtime reasons

        const downtimeReasonsImportCfg = await importDowntimeReasons.prepareCfg(client);
        this.dumpUpdateActions(downtimeReasonsImportCfg.updateActions);

        console.log("downtime reasons EXECUTE UPDATE ACTIONS");
        await this.executeUpdateActions(client, downtimeReasonsImportCfg.updateActions);

        // operation run/suspend reasons

        const operationRunSuspendReasonsImportCfg = await importOperationRunSuspendReasons.prepareCfg(client);
        this.dumpUpdateActions(operationRunSuspendReasonsImportCfg.updateActions);

        console.log("operation run/suspend reasons EXECUTE UPDATE ACTIONS");
        await this.executeUpdateActions(client, operationRunSuspendReasonsImportCfg.updateActions);

        // overtime reasons

        const overtimeReasonsImportCfg = await importOvertimeReasons.prepareCfg(client);
        this.dumpUpdateActions(overtimeReasonsImportCfg.updateActions);

        console.log("overtime reasons EXECUTE UPDATE ACTIONS");
        await this.executeUpdateActions(client, overtimeReasonsImportCfg.updateActions);

        // underproduction reasons

        const underproductionReasonsImportCfg = await importUnderproductionReasons.prepareCfg(client);
        this.dumpUpdateActions(underproductionReasonsImportCfg.updateActions);

        console.log("underproduction reasons EXECUTE UPDATE ACTIONS");
        await this.executeUpdateActions(client, underproductionReasonsImportCfg.updateActions);

        // enterprise struct available reasons

        console.log("available reasons UPDATE ACTIONS");
        const enterpriseStructAvailableReasonsUpdateActions = await compareEnterpriseStructAvailableReasons.generateUpdateActions(
            client,
            enterpriseStructImportCfg.enterpriseCfg,
            downtimeReasonsImportCfg.reasonsCfg,
            operationRunSuspendReasonsImportCfg.reasonsCfg,
            overtimeReasonsImportCfg.reasonsCfg,
            underproductionReasonsImportCfg.reasonsCfg
        );
        this.dumpUpdateActions(enterpriseStructAvailableReasonsUpdateActions);

        console.log("available reasons EXECUTE UPDATE ACTIONS");
        await this.executeUpdateActions(client, enterpriseStructAvailableReasonsUpdateActions);

        // workCenter groups

        const workCenterGroupsImportCfg = await importWorkCenterGroups.prepareCfg(client);
        this.dumpUpdateActions(workCenterGroupsImportCfg.updateActions);

        console.log("workCenter groups EXECUTE UPDATE ACTIONS");
        await this.executeUpdateActions(client, workCenterGroupsImportCfg.updateActions);

        // workCenter props

        console.log("workCenter props UPDATE ACTIONS");
        const workCenterPropsUpdateActions = await compareWorkCenterProps.generateUpdateActions(
            client,
            enterpriseStructImportCfg.enterpriseCfg,
            workCenterGroupsImportCfg.groupsCfg
        );
        this.dumpUpdateActions(workCenterPropsUpdateActions);

        console.log("workCenter props EXECUTE UPDATE ACTIONS");
        await this.executeUpdateActions(client, workCenterPropsUpdateActions);

        // 3D models

        const import3DModelsCfg = await import3DModels.prepareCfg(client);
        this.dumpUpdateActions(import3DModelsCfg.updateActions);

        console.log("3D models EXECUTE UPDATE ACTIONS");
        await this.executeUpdateActions(client, import3DModelsCfg.updateActions);

        const import3DModelsAttachmentsCfg = await import3DModelsAttachments.prepareCfg(client, enterpriseStructImportCfg.enterpriseCfg, import3DModelsCfg.modelsCfg);
        this.dumpUpdateActions(import3DModelsAttachmentsCfg.updateActions);

        console.log("attach 3D models EXECUTE UPDATE ACTIONS");
        await this.executeUpdateActions(client, import3DModelsAttachmentsCfg.updateActions);

        // dashboards

        const importDashboardsCfg = await importDashboards.prepareCfg(client, enterpriseStructImportCfg.enterpriseCfg);
        this.dumpUpdateActions(importDashboardsCfg.updateActions);

        console.log("dashboards EXECUTE UPDATE ACTIONS");
        await this.executeUpdateActions(client, importDashboardsCfg.updateActions);

        // drivers

        const importDriversCfg = await importDrivers.prepareCfg(client);
        this.dumpUpdateActions(importDriversCfg.updateActions);

        console.log("drivers EXECUTE UPDATE ACTIONS");
        await this.executeUpdateActions(client, importDriversCfg.updateActions);
    }
}
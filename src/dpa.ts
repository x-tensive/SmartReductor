import http, { IncomingMessage, OutgoingHttpHeaders } from "http";

export enum enterpriseStructTypes
{
    root = 0,
    enterprise = 1,
    site = 2,
    department = 3,
    workCenter = 4,
    storageZone = 26,
    workCenterContainer = 6,
    storageZoneContainer = 29
}

interface dpa_CALL_success
{
    response: IncomingMessage,
    body: Buffer
}

export class dpaEnumItem
{
    readonly id: number;
    readonly enum: string;
    readonly name: string;

    constructor(item: any)
    {
        this.id = item.id;
        this.enum = item.enum;
        this.name = item.name;
    }
}

export class dpaEnum
{
    readonly data: dpaEnumItem[];

    byName = (_name: string) => this.data.find((item) => item.name == _name);
    byEnum = (_enum: string) => this.data.find((item) => item.enum == _enum);

    constructor(items: any[])
    {
        this.data = items.map((item: any) => new dpaEnumItem(item));
    }
}

export class dpa {
    readonly url: string;
    readonly user: string;
    readonly password: string;

    private __cookies: any;
    private __hostName: string | undefined;
    private __hostVersion: string | undefined;
    private __shiftTemplateTypes: dpaEnum | undefined;

    private CALL(endPoint: string, method: string, headers: OutgoingHttpHeaders, body: any): Promise<dpa_CALL_success>
    {
        var epUrl = new URL(endPoint, this.url);

        var options = {
            method: method,
            headers: headers
        };

        return new Promise<dpa_CALL_success>((resolve, reject) => {
            var request = http.request(epUrl, options, (response: IncomingMessage) => {
                let chunks_of_data: any[] = [];
                response.on("data", (fragments) => {
                    chunks_of_data.push(fragments);
                });
                response.on('end', () => {
                    if (response.statusCode && response.statusCode < 400)
                        resolve({ response: response, body: Buffer.concat(chunks_of_data) });
                    else
                        reject({ response: response });
                });
                response.on("error", (error) => { 
                    reject({ response: response, error: error });
                });
            });
            request.write(body);
            request.end();
        });
    }

    private REST_JSON_CALL(endPoint: string, method: string, body: any): Promise<dpa_CALL_success>
    {
        const bodyStr = JSON.stringify(body);
        const headers = {
            "Content-Type" : "application/json",
            "Content-Length" : Buffer.byteLength(bodyStr, "utf8"),
            "Cookie": this.__cookies ? this.__cookies : []
        };
        return this.CALL(endPoint, method, headers, bodyStr);
    }

    private async REST_JSON_TRANSACTION(endPoint: string, method: string, body: any): Promise<any>
    {
        const result = await this.REST_JSON_CALL(endPoint, method, body);
        return JSON.parse(result.body.toString());
    }

    private async getHostData(): Promise<void>
    {
        const hostData = await this.REST_JSON_TRANSACTION("/api/DPA/getHost", "GET", null);
        this.__hostName = hostData.name;
        this.__hostVersion = hostData.dpaHostVersion;
    }

    public async getHostName(): Promise<string>
    {
        if (!this.__hostName)
            await this.getHostData();
        return this.__hostName!;
    }

    public async getHostVersion(): Promise<string>
    {
        if (!this.__hostVersion)
            await this.getHostData();
        return this.__hostVersion!;
    }

    static async login(url: string, user: string, password: string): Promise<dpa>
    {
        let client = new dpa(url, user, password);
        await client
            .REST_JSON_CALL("/api/Account/Login", "POST", { userName: user, password: password })
            .then((result) => {
                client.__cookies = result.response.headers["set-cookie"];
            });
        return client;
    }

    public async logout(): Promise<void>
    {
        await this.REST_JSON_CALL("/api/Account/Logout", "POST", null);
    }

    private async getEnumValues(name: string): Promise<dpaEnum>
    {
        const items = await this.REST_JSON_TRANSACTION("/api/data/getEnumValues/" + name, "GET", null);
        return new dpaEnum(items);
    }

    public async getShiftTemplateTypes(): Promise<dpaEnum>
    {
        if (!this.__shiftTemplateTypes)
            this.__shiftTemplateTypes = await this.getEnumValues("ScheduleTemplateType");
        return this.__shiftTemplateTypes;
    }

    public async manageEnterpriseStructure_getDynamicTree(parentTypeId: number, parentId: number): Promise<any[]>
    {
        return this.REST_JSON_TRANSACTION("/api/ManageEnterpriseStructure/getDynamicTree/" + parentTypeId + "/" + parentId, "GET", null);
    }

    public async manageEnterpriseStructure_createWorkCenter(departmentId: number, name: string): Promise<any>
    {
        return this.REST_JSON_TRANSACTION("/api/ManageEnterpriseStructure/createEquipment", "POST", {
            departmentId: departmentId,
            name: name,
            serverId: 0,
            driverIdentifier: "00000000-0000-0000-0000-000000000000",
            equipmentGroupIds: [],
            equipmentGroupNames: null
        });
    }

    public async manageEnterpriseStructure_removeWorkCenter(id: number): Promise<any>
    {
        return this.REST_JSON_TRANSACTION("/api/ManageEnterpriseStructure/removeEquipment/" + id, "POST", null);
    }

    public async manageEnterpriseStructure_createStorageZone(departmentId: number, name: string, address: string): Promise<any>
    {
        return this.REST_JSON_TRANSACTION("/api/ManageEnterpriseStructure/createStorageZone", "POST", {
            departmentId: departmentId,
            name: name,
            address: address
        });
    }

    public async manageEnterpriseStructure_removeStorageZone(id: number): Promise<any>
    {
        return this.REST_JSON_TRANSACTION("/api/ManageEnterpriseStructure/removeStorageZone/" + id, "GET", null);
    }

    public async manageEnterpriseStructure_createDepartment(siteId: number, parentDepartmentId: number, name: string): Promise<any>
    {
        return this.REST_JSON_TRANSACTION("/api/ManageEnterpriseStructure/createDepartment", "POST", {
            siteId: siteId,
            name: name,
            ownerDepartmentId: parentDepartmentId
        });
    }

    public async manageEnterpriseStructure_removeDepartment(id: number): Promise<any>
    {
        return this.REST_JSON_TRANSACTION("/api/ManageEnterpriseStructure/removeDepartment/" + id, "POST", null);
    }

    public async manageEnterpriseStructure_createSite(enterpriseId: number, name: string): Promise<any>
    {
        return this.REST_JSON_TRANSACTION("/api/ManageEnterpriseStructure/createSite", "POST", {
            enterpriseId: enterpriseId,
            name: name
        });
    }

    public async manageEnterpriseStructure_removeSite(id: number): Promise<any>
    {
        return this.REST_JSON_TRANSACTION("/api/ManageEnterpriseStructure/removeSite/" + id, "POST", null);
    }

    public async manageEnterpriseStructure_createEnterprise(name: string): Promise<any>
    {
        return this.REST_JSON_TRANSACTION("/api/ManageEnterpriseStructure/create", "POST", {
            name: name
        });
    }

    public async manageEnterpriseStructure_removeEnterprise(id: number): Promise<any>
    {
        return this.REST_JSON_TRANSACTION("/api/ManageEnterpriseStructure/removeEnterprise/" + id, "POST", null);
    }

    public async referenceBook_getShifts(): Promise<any>
    {
        return this.REST_JSON_TRANSACTION("/api/ReferenceBook/getReferenceBookDatas/ShiftName", "POST", {});
    }

    public async referenceBook_createShift(name: string, color: string, isWorkingTime: boolean): Promise<any>
    {
        let record = await this.REST_JSON_TRANSACTION("/api/ReferenceBook/getReferenceBookRecord/ShiftName/0", "GET", null);
        record.fields.find((item: any) => item.name == "Name").value = name;
        record.fields.find((item: any) => item.name == "Color").value = color;
        record.fields.find((item: any) => item.name == "IsWorkingTime").value = isWorkingTime;
        return this.REST_JSON_TRANSACTION("/api/ReferenceBook/saveReferenceBookRecord", "POST", record);
    }

    public async referenceBook_updateShift(id: number, name: string, color: string, isWorkingTime: boolean): Promise<any>
    {
        let record = await this.REST_JSON_TRANSACTION("/api/ReferenceBook/getReferenceBookRecord/ShiftName/" + id, "GET", null);
        record.fields.find((item: any) => item.name == "Name").value = name;
        record.fields.find((item: any) => item.name == "Color").value = color;
        record.fields.find((item: any) => item.name == "IsWorkingTime").value = isWorkingTime;
        return this.REST_JSON_TRANSACTION("/api/ReferenceBook/saveReferenceBookRecord", "POST", record);
    }

    public async referenceBook_removeShift(id: number): Promise<any>
    {
        return this.REST_JSON_TRANSACTION("/api/ReferenceBook/removeReferenceBookRecord/ShiftName/" + id, "POST", null);
    }

    public async referenceBook_getShiftTemplates(): Promise<any>
    {
        return this.REST_JSON_TRANSACTION("/api/ReferenceBook/getReferenceBookDatas/ScheduleTemplate", "POST", {});
    }

    public async referenceBook_getShiftTemplate(id: number): Promise<any>
    {
        return this.REST_JSON_TRANSACTION("/api/schedule/getScheduleTemplateRecord/" + id, "POST", null);
    }

    public async referenceBook_createShiftTemplate(name: string, type: string, intervals: any[]): Promise<any>
    {
        let record = await this.REST_JSON_TRANSACTION("/api/schedule/getScheduleTemplateRecord/0", "POST", null);
        record.name = name;
        record.templateType = (await this.getShiftTemplateTypes()).byEnum(type)!.id;
        record.intervals = intervals;
        return this.REST_JSON_TRANSACTION("/api/schedule/saveScheduleTemplateRecord", "POST", record);
    }

    public async referenceBook_updateShiftTemplate(id: number, name: string, type: string, intervals: any[]): Promise<any>
    {
        let record = await this.REST_JSON_TRANSACTION("/api/schedule/getScheduleTemplateRecord/" + id, "POST", null);
        record.name = name;
        record.templateType = (await this.getShiftTemplateTypes()).byEnum(type)!.id;
        record.intervals = intervals;
        return this.REST_JSON_TRANSACTION("/api/schedule/saveScheduleTemplateRecord", "POST", record);
    }

    public async referenceBook_removeShiftTemplate(id: number): Promise<any>
    {
        return this.REST_JSON_TRANSACTION("/api/ReferenceBook/removeReferenceBookRecord/ScheduleTemplate/" + id, "POST", null);
    }

    private constructor(url: string, user: string, password: string)
    {
        this.url = url;
        this.user = user;
        this.password = password;
    }
}
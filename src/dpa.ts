import http, { IncomingMessage, OutgoingHttpHeaders } from "http";
import internal from "stream";

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

interface dpa_CALL_error
{
    response: IncomingMessage,
    error: Error
}

export class dpa {
    readonly url: string;
    readonly user: string;
    readonly password: string;

    private __cookies: any;
    private __hostName: string | undefined;
    private __hostVersion: string | undefined;

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

    public async manageEnterpriseStructure_getDynamicTree(parentTypeId: number, parentId: number): Promise<any[]>
    {
        return this.REST_JSON_TRANSACTION("/api/ManageEnterpriseStructure/getDynamicTree/" + parentTypeId + "/" + parentId, "GET", null);
    }

    private constructor(url: string, user: string, password: string)
    {
        this.url = url;
        this.user = user;
        this.password = password;
    }
}
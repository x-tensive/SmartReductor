export class dpa {
    readonly url: string;
    readonly user: string;
    readonly password: string;

    private __hostName: string | undefined;
    private __hostVersion: string | undefined;

    public getHostName(): string
    {
        if (!this.__hostName) {
            this.__hostName = "HOST";
        }
        return this.__hostName;
    }

    public getHostVersion(): string
    {
        if (!this.__hostVersion) {
            this.__hostVersion = "1.0.0.0";
        }
        return this.__hostVersion;
    }

    static login(url: string, user: string, password: string): dpa
    {
        return new dpa(url, user, password);
    }

    public logout(): void
    {
    }

    private constructor(url: string, user: string, password: string)
    {
        this.url = url;
        this.user = user;
        this.password = password;
    }
}
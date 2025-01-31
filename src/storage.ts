export class Preferences {

    static readonly IS_ENABLED_KEY = "is_enabled";
    static readonly DOMAIN_EXCLUSIONS_KEY = "domain_exclusions";

    private static _isEnabled: boolean = true;
    private static _domainExclusions: string[] = [];

    static async refresh() {
        console.log("Refreshing settings");
        await this.getPreference(this.IS_ENABLED_KEY);
        await this.getPreference(this.DOMAIN_EXCLUSIONS_KEY);
    }
    static async initDefaults() {
        console.log("Defaulting settings");
        this.isEnabled = true;
        this.domainExclusions = [];
    }

    static get isEnabled(): boolean {
        return this._isEnabled;
    }

    static set isEnabled(isEnabled: boolean) {
        this._isEnabled = isEnabled;
        this.setPreference(Preferences.IS_ENABLED_KEY, isEnabled);
    }

    static get domainExclusions(): string[] {
        return this._domainExclusions;
    }

    static set domainExclusions(domains: string[] ) {
        this._domainExclusions = domains;
        this.setPreference(Preferences.DOMAIN_EXCLUSIONS_KEY, domains);
    }

    public static dump(): void {
        let msg: string = `IsEnabled = ${Preferences._isEnabled}, DomainExclusions = ${Preferences._domainExclusions}`;
        console.log(msg);
    }

    // TODO: inject a 'backing store' implementation, type depends on browser API
    static async setPreference (key: string, value: any) {
        await chrome.storage.sync.set({ [key]: value });
        console.log(`Set pref: ${key} = ${value}`);
    };

    static async getPreference (key: string): Promise<any | undefined> {
        return new Promise((resolve) => {
            console.log(`Get pref: ${key}`);
            chrome.storage.sync.get(key, (result) => resolve(result[key]));
        });
    };

    static async setStorage(key: string, value: any) {
        await chrome.storage.local.set({ [key]: value });
        console.log(`Save store: ${key} = ${value}`);
    };

    static async getStorage (key: string): Promise<any | undefined> {
        return new Promise((resolve) => {
            console.log(`Get store: ${key}`);
            chrome.storage.local.get(key, (result) => resolve(result[key]));
        });
    };


}

export class Preferences {
    static readonly IS_ENABLED_KEY = 'is_enabled';
    static readonly DOMAIN_EXCLUSIONS_KEY = 'domain_exclusions';

    private static _isEnabled: boolean = true;

    static get isEnabled(): boolean {
        return this._isEnabled;
    }

    static set isEnabled(isEnabled: boolean) {
        this._isEnabled = isEnabled;
        void this.setPreference(Preferences.IS_ENABLED_KEY, isEnabled);
    }

    private static _domainExclusions: string[] = [];

    static get domainExclusions(): string[] {
        return this._domainExclusions;
    }

    static set domainExclusions(domains: string[]) {
        this._domainExclusions = domains;
        void this.setPreference(Preferences.DOMAIN_EXCLUSIONS_KEY, domains);
    }

    static async refresh() {
        console.log('Refreshing settings');
        await this.getPreference(this.IS_ENABLED_KEY);
        await this.getPreference(this.DOMAIN_EXCLUSIONS_KEY);
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    static async initDefaults() {
        console.log('Defaulting settings');
        this.isEnabled = true;
        this.domainExclusions = [];
    }

    public static dump(): void {
        const msg: string = `IsEnabled = ${Preferences._isEnabled.toString()}, DomainExclusions = ${Preferences._domainExclusions.toString()}`;
        console.log(msg);
    }

    // TODO: inject a 'backing store' implementation, type depends on browser API
    static async setPreference(key: string, value: unknown) {
        await chrome.storage.sync.set({ [key]: value });
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        console.log(`Set pref: ${key} = ${value}`);
    }

    static async getPreference(key: string): Promise<unknown> {
        return new Promise((resolve) => {
            console.log(`Get pref: ${key}`);
            chrome.storage.sync.get(key, (result) => {
                resolve(result[key]);
            }); // TODO: Use return value instead (MV3)
        });
    }

    static async setStorage(key: string, value: unknown) {
        await chrome.storage.local.set({ [key]: value });
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        console.log(`Save store: ${key} = ${value}`);
    }

    static async getStorage(key: string): Promise<unknown> {
        return new Promise((resolve) => {
            console.log(`Get store: ${key}`);
            chrome.storage.local.get(key, (result) => {
                resolve(result[key]);
            }); // TODO: Use return value instead (MV3)
        });
    }
}

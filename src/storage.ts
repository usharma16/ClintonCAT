import { ValueListener, OrderedSetListener } from './listeners';

export class Preferences {
    static readonly IS_ENABLED_KEY = 'is_enabled';
    static readonly DOMAIN_EXCLUSIONS_KEY = 'domain_exclusions';

    static isEnabled = new ValueListener<boolean>(true);
    static domainExclusions = new OrderedSetListener<string>();

    static async refresh() {
        console.log('Refreshing settings');
        await this.getPreference(this.IS_ENABLED_KEY);
        await this.getPreference(this.DOMAIN_EXCLUSIONS_KEY);
    }

    static init() {
        this.isEnabled.removeAllListeners();
        this.isEnabled.value = true;
        this.isEnabled.addListener(this.IS_ENABLED_KEY, (result: boolean) => {
            void this.setPreference(Preferences.IS_ENABLED_KEY, result);
        });
        this.domainExclusions.removeAllListeners();
        this.domainExclusions.value = [];
        this.domainExclusions.addListener(this.DOMAIN_EXCLUSIONS_KEY, (result: string[]) => {
            void this.setPreference(Preferences.DOMAIN_EXCLUSIONS_KEY, result);
        });
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    static async initDefaults() {
        console.log('Defaulting settings'); // TODO: Get from localStorage
        this.init();
    }

    public static dump(): void {
        const msg: string = `IsEnabled = ${Preferences.isEnabled.toString()}, DomainExclusions = ${Preferences.domainExclusions.toString()}`;
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

export class DomainTools {
  private twoLevelTLDs = ["co.uk", "gov.uk", "com.au", "org.uk", "ac.uk"];

  constructor() {
    // TODO: load https://publicsuffix.org into twoLevelTLDs
  }

  extractMainDomain(hostname: string) {
    const cleanHostname = hostname.replace(/^www\./, "");
    const parts = cleanHostname.split(".");

    for (let tld of this.twoLevelTLDs) {
      const tldParts = tld.split(".");
      if (
        parts.length > tldParts.length &&
        parts.slice(-tldParts.length).join(".") === tld
      ) {
        return parts.slice(-(tldParts.length + 1), -tldParts.length).join(".");
      }
    }

    // Default case for regular TLDs like .com, .net, etc.
    if (parts.length > 2) {
      return parts.slice(-2, -1)[0];
    } else {
      return parts[0];
    }
  }

  isDomainExcluded(exclusions: string[], domain: string): boolean {
    if (exclusions == null) {
      return false;
    }
    return exclusions.some((excludedDomain: string) =>
      domain.includes(excludedDomain),
    );
  }
}

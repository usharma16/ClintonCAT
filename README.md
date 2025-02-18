# Clinton CAT

![GitHub Release](<https://img.shields.io/github/v/release/WayneKeenan/ClintonCAT?include_prereleases&color=rgba(28%2C%20181%2C%2033%2C%201)&label=Release>)
![GitHub contributors](<https://img.shields.io/github/contributors/WayneKeenan/ClintonCAT?label=Contributors&color=rgba(28%2C%20181%2C%2033%2C%201)>)
![GitHub Downloads](https://img.shields.io/github/downloads/WayneKeenan/ClintonCAT/total?label=Downloads&color=blue)
![GitHub Issues](https://img.shields.io/github/issues/WayneKeenan/ClintonCAT?label=Issues)
![GitHub Pull Requests](https://img.shields.io/github/issues-pr/WayneKeenan/ClintonCAT?label=Pull%20Requests)

<!-- https://shields.io/badges/chrome-web-store-rating -->
<!-- https://shields.io/badges/mozilla-add-on-rating -->

## About

# EXPERIMENTAL

Chrome Browser Extension for automatically
searching [Rossmann's Consumer Action Taskforce (CAT)](https://wiki.rossmanngroup.com/wiki/Mission_statement) articles
for the current site being visited.<br>

> All references found by this software are not part of ClintonCAT and are provided to the end-user under `CC-4.0-BY-SA licensing` as stated [here](https://wiki.rossmanngroup.com/wiki/Consumer_Action_Taskforce:Copyrights) by the originating website [wiki.rossmanngroup.com](wiki.rossmanngroup.com).

## Operation

If a CAT wiki page for the website is found then the plugin toolbar icon will indicate the number of controversies found.
You might also see a clickable angry cat image in the page.

## Install

As this is not yet on any Web Store it's necessary to download and manually install it.
Note: the current latest release is very old, and it's recommended to build from source.

### For Chrome:

1. Download a [release](https://github.com/WayneKeenan/ClintonCAT/releases).
2. Open Extension settings: e.g. `chrome://extensions/` or `brave://extensions/` etc.
3. Enable Developer Mode
4. Click `Load Unpacked`
5. Navigate to the unzipped folder.

### For Firefox:

1. Open: about:debugging#/runtime/this-firefox
2. Expand 'Temporary Extensions'
3. Click 'Load Temporary Add-on...'
4. Navigate to the unzipped folder and open `manifest.json`

### For Safari

1. Build from source.

# Developer

## Checkout and build the extension:

### Chrome & Firefox

```shell
git checkout git@github.com:WayneKeenan/ClintonCAT.git
cd ClintonCAT
npm install
npm run build:chromium    # Chrome
# or
npm run build:gecko       # Firefox
```

The compiled extension will be output in the `dist` folder.

### Safari (iOS and macOS)

Perform the above steps for the `chromium` build then open the [XCode project](engines/safari/ClintonCAT/ClintonCAT.xcodeproj) and build for your preferred OS(es).

## Contributing

We welcome contributions! Please read our [CONTRIBUTING.md](.github/CONTRIBUTING.md) guide for details on how to contribute.

# Contributions

Thanks to contributions from the following people that I added outside of a PR:

- @blimeybloke (Settings and whitelisting)
- @lnardon (Firefox)
- @khonkhortisan (Firefox)
- @SalimOfShadow (Multiple tab prevention)
- @EricFrancis12 (Toggle on/off)

# Attributions

- [Icons on the html test page by Gatoon Team](https://www.iconarchive.com/show/gartoon-devices-icons-by-gartoon-team.html)

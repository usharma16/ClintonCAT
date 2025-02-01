# Clinton CAT

## About

# EXPERIMENTAL

Chrome Browser Extension for automatically
searching [Rossmann's Consumer Action Taskforce (CAT)](https://wiki.rossmanngroup.com/wiki/Mission_statement) articles
for the current site being visited.

## Operation

If a CAT wiki page for the domain is found then a new tab is opened in the background with the wiki article.

## Install

As this is not yet on the Chrome Web Store it's necessary to download and manually install it:

1. Download a [release](https://github.com/WayneKeenan/ClintonCAT/releases) .
2. Open Extension settings: e.g. `chrome://extensions/`  or `brave://extensions/` etc.
3. Enable Developer Mode
4. Click `Load Unpacked`
5. Navigate to the cloned/unzipped folder.


# Developer

Checkout and build the extension:

```shell
git checkout git@github.com:WayneKeenan/ClintonCAT.git
cd ClintonCAT
npm install
npx webpack
```

Compiled extension will be output in the `dist` folder.

# Contributions

Thanks to contributions from the following people that I added outside of a PR:

- @blimeybloke  (Settings and whitelisting)
- @lnardon (Firefox)
- @khonkhortisan (Firefox)
- @SalimOfShadow (Multiple tab prevention)
- @EricFrancis12 (Toggle on/off)

# Attributions

- [Icons by Gatoon Team](https://www.iconarchive.com/show/gartoon-devices-icons-by-gartoon-team.html)


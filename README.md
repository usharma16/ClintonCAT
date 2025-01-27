# Clinton CAT

## About

Chrome Browser Extension for automatically searching [Rossmann's Consumer Action Taskforce (CAT)](https://wiki.rossmanngroup.com/wiki/Mission_statement) articles for the current site being visited. 

## Operation

If a CAT wiki page for the domain is found then a new tab is opened in the background for the wiki article.

## Install

As this is not yet on the Chrome Web Store it's necessary to download and manually install it: 

1. Clone or download a [zip](https://github.com/WayneKeenan/ClintonCAT/archive/refs/heads/main.zip) of this repo. 
2. Open Extension settings: e.g. `chrome://extensions/`  or `brave://extensions/` etc.
3. Enable Developer Mode
4. Click `Load Unpacked`
5. Navigate to the cloned/unzipped folder.

## TODO

- [ ] Platform: Safari Extension
- [ ] UI: Alternate notification strategy: Icon change
- [ ] UI: Alternate notification strategy: overlay button in-page header
- [ ] UI: Search in-page
- [ ] User Config: Preferred notification strategy
- [ ] User Config: Whitelisting sites for notification surpression
- [ ] Logic: Extending the trailing TLD list
- [ ] Logic: More accurate Wiki search (e.g. only display pages with 'Controversies')

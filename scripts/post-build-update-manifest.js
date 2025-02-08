const fs = require('fs');
const path = require('path');

const rootPath = path.resolve('./');
const packageJson = require(`${rootPath}/package.json`);
const baseManifestJson = require(`${rootPath}/engines/common/manifest.json`);
const manifestFilePath = path.resolve(__dirname, `${rootPath}/dist/manifest.json`);

try {
    // Read the manifest file
    let manifest = JSON.parse(fs.readFileSync(manifestFilePath));

    // Get the following values from package.json
    manifest.version = packageJson.version;
    manifest.description = packageJson.description;
    manifest = { ...manifest, ...baseManifestJson };

    // Write the updated manifest file
    fs.writeFileSync(manifestFilePath, JSON.stringify(manifest, null, 2));

    console.log(`Version updated to ${packageJson.version} in manifest.json.`);
} catch (error) {
    console.error(`Error updating manifest.json: ${error.message}`);
}

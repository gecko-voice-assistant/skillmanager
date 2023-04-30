const path = require("path");
const fs = require("fs");
const configDir = path.join(__dirname, "..", "config");

function readFromConfigFile(filename = "scratch"){
    let pathToConfig = path.join(configDir, `${filename}.json`);
    if (!fs.existsSync(pathToConfig)) writeToConfigFile(filename, "{}");
    return JSON.parse(fs.readFileSync(pathToConfig).toString());
}

function writeToConfigFile(config, filename = "scratch"){
    if (config && typeof config  === "object") {
        fs.writeFileSync(path.join(configDir, `${filename}.json`), JSON.stringify(config, null, 1));
    }
}

async function asyncFilter(arr, callback) {
    const fail = Symbol()
    return (await Promise.all(arr.map(async item => (await callback(item)) ? item : fail))).filter(i=>i!==fail)
}

module.exports = {
    readFromConfigFile, writeToConfigFile, asyncFilter
}
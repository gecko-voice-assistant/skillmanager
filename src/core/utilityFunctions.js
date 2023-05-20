const path = require("path");
const fs = require("fs");
const configDir = path.join(__dirname, "..", "config");

function readFromConfigFile(filename = "scratch") {
    try {
        let pathToConfig = path.join(configDir, `${filename}.json`);
        if (!fs.existsSync(pathToConfig)) writeToConfigFile(filename, "{}");
        return JSON.parse(fs.readFileSync(pathToConfig).toString());
    } catch (err) {
        printError(err);
        return {};
    }
}

function writeToConfigFile(config, filename = "scratch") {
    if (config && typeof config === "object") {
        fs.writeFileSync(path.join(configDir, `${filename}.json`), JSON.stringify(config, null, 1));
    }
}

async function asyncFilter(arr, callback) {
    const fail = Symbol();
    return (await Promise.all(arr.map(async (item) => ((await callback(item)) ? item : fail)))).filter(
        (i) => i !== fail
    );
}

function printError(err) {
    let error;
    if (typeof err === "object" && err.name === "Error") {
        error = err;
    } else {
        error = new Error(err);
    }
    // eslint-disable-next-line no-console
    console.error(error);
}

function printLog(...data) {
    // eslint-disable-next-line no-console
    console.log(...data);
}

module.exports = {
    readFromConfigFile,
    writeToConfigFile,
    asyncFilter,
    printError,
    printLog,
};

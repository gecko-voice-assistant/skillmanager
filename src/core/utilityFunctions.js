/*
This file is part of G.E.C.K.O.
Copyright (C) 2023  Finn Wehn

G.E.C.K.O. is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
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

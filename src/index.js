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
const { startAPI } = require("./core/api");
const { startMQTTClient } = require("./core/mqttClient");
const { startHermesAdapter } = require("./core/hermesAdapter");
const { startSkillHandler } = require("./core/skillHandler");
const { printError, printLog, readFromConfigFile, writeToConfigFile } = require("./core/utilityFunctions");
const { startRhasspyAdapter } = require("./core/rhasspyAdapter");

const mainConfig = readFromConfigFile("main");
const skillConfig = readFromConfigFile("skills");

if (Object.keys(mainConfig).length === 0) {
    writeToConfigFile(
        {
            apiPort: 3000,
            skillserver: "https://skillserver.fwehn.de",
            language: "de_DE",
            mqttHost: "mqttbroker",
            mqttPort: 1883,
            rhasspy: "http://rhasspy",
        },
        "main"
    );
}

if (Object.keys(skillConfig).length === 0) {
    writeToConfigFile(
        {
            skills: {},
        },
        "skills"
    );
}

init().catch((err) => {
    printError(err);
    process.exit(1);
});

async function init() {
    [
        await startMQTTClient(mainConfig["mqttHost"] || "127.0.0.1", mainConfig["mqttPort"] || "1883"),
        await startRhasspyAdapter(mainConfig["rhasspy"] || "http://127.0.0.1:12101"),
        await startHermesAdapter(),
        await startSkillHandler(),
        await startAPI(mainConfig["apiPort"] || 3000),
    ].forEach((msg) => printLog(msg));
}

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
const axios = require("axios");
const { readLocaleFile } = require("./skillFileManager");
const { printLog } = require("./utilityFunctions");
let rhasspyPath;

async function startRhasspyAdapter(rhasspy = "http://127.0.0.1:12101") {
    rhasspyPath = rhasspy;

    return "Hermes-Adapter started";
}

async function postToRhasspyAPI(endpoint = "", body = {}) {
    return await axios.post(`${rhasspyPath}${endpoint}`, body, {});
}

async function trainRhasspy() {
    return await postToRhasspyAPI("/api/train", {});
}

async function postSlots(slotName, alternatives, overwrite = false) {
    let data = {};
    data[`slots/${slotName}`] = alternatives;

    return await postToRhasspyAPI(`/api/slots?overwrite_all=${overwrite}`, data);
}

async function registerSkill(skillName) {
    const skill = readLocaleFile(skillName);

    for (let slot in skill["slots"]) {
        await postSlots(`${skillName}_${slot}`, skill["slots"][slot], true);
    }

    let intentStringLines = [];
    for (let i in skill["intents"]) {
        intentStringLines.push(`[${skillName}_${i}]`);
        const sentences = skill["intents"][i]["sentences"];

        sentences.forEach((sentence) => {
            intentStringLines.push(`($slots/launch){launch} ${skill["invocation"]} ${sentence}`);
        });
    }

    let intentString = intentStringLines.join("\n");

    const regex = /\(\$slots\/(\b\w+\b)\){(\b\w+\b)}/g;
    const defaultSlots = ["launch", "gecko_days"];

    intentString = intentString.replaceAll(regex, (substring, slotName, slotReference) => {
        let newSlotName = defaultSlots.includes(slotName) ? slotName : `${skillName}_${slotName}`
        return `($slots/${newSlotName}){${slotReference}}`;
    })

    printLog(intentString);

    let data = {};
    data[`intents/${skillName}.ini`] = intentString;
    await postToRhasspyAPI("/api/sentences", data);
    return await trainRhasspy();
}

async function unregisterSkill(skillName) {
    const skill = readLocaleFile(skillName);

    for (let slot in skill["slots"]) {
        await postSlots(`${skillName}_${slot}`, [], true);
    }

    let data = {};
    data[`intents/${skillName}.ini`] = "";
    await postToRhasspyAPI("/api/sentences", data);
    return await trainRhasspy();
}

module.exports = {
    startRhasspyAdapter,
    registerSkill,
    unregisterSkill,
};

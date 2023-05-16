const axios = require("axios");
const { readFromConfigFile } = require("./utilityFunctions");
const { readLocaleFile } = require("./skillFileManager");
const rhasspyPath = readFromConfigFile("main")["rhasspy"] || "http://127.0.0.1:12101";

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

    let slotsToReplace = [];
    const regex = /\(\$slots\/(\b\w+\b)\){(\b\1\b)}|\(\d+\.\.\d+\){(\b\w+\b)}/g;
    [...intentString.matchAll(regex)].forEach((match) => {
        slotsToReplace.push(...match.slice(1, 4));
    });

    const defaultSlots = ["launch"];
    slotsToReplace = [...new Set(slotsToReplace)].filter((slotName) => !!slotName && !defaultSlots.includes(slotName));

    slotsToReplace.forEach((slot) => {
        intentString = intentString.replaceAll(slot, `${skillName}_${slot}`);
    });

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
    registerSkill,
    unregisterSkill,
};

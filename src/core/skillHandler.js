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
const skillFileManager = require("./skillFileManager");
const { printError, printLog } = require("./utilityFunctions");
const gsk = require("gecko-skillkit");
const { getActiveSkills, getSkillOptions } = require("./skillFileManager");

let sessionData = {
    sessionId: "",
    siteId: "",
    skill: "",
    answers: []
};

async function startSkillHandler() {
    await skillFileManager.loadSkills();

    gsk.setConfigData({
        answerFunction: generateAnswer,
        optionsFunction: getAllOptions
    });

    return "Skill-Handler started";
}

function getSessionData() {
    return sessionData;
}

function updateSkills(newSkills) {
    Object.assign(getActiveSkills(), newSkills);
}

function handleSkill(skill, intent, slots, siteId, sessionId) {
    sessionData["siteId"] = siteId;
    sessionData["sessionId"] = sessionId;

    executeIntent(skill, intent, slots).then(printLog).catch(printError);
}

function generateAnswer(answerIndex, ...args) {
    const answers = sessionData.answers;
    let generatedAnswer = "";

    if (answers[answerIndex]) {
        const answerParts = answers[answerIndex].split("#");
        answerParts.forEach((part, index) => {
            generatedAnswer += part + (args[index] || "");
        });
    }

    return generatedAnswer;
}

function getAllOptions() {
    const options = getSkillOptions(sessionData.skill);
    let returnObject = {};

    for (let i in options){
        returnObject[i] = options[i]["value"] || "";
    }

    return returnObject;
}

function executeIntent(skill, intent, slots) {
    return new Promise((resolve, reject) => {
        try {
            const intentData = skillFileManager.getIntentData(skill, intent);
            const functionName = intentData["function"];
            sessionData.skill = skill;
            sessionData.answers = intentData["answers"];

            const args = intentData["args"].map((parameterName) => {
                return slots.find(slot => slot["slotName"] === parameterName)["value"]["value"];
            });

            getActiveSkills()[skill][functionName].apply(this, args);

            resolve(`Executing ${skill}.${functionName} with parameters ${args.join(", ")}`);
        } catch (err) {
            reject(err);
        }
    });
}

module.exports = {
    startSkillHandler,
    handleSkill,
    getSessionData,
    updateSkills,
};

const skillFileManager = require("./skillFileManager");

let skills = {};

let sessionData = {
    sessionId: "",
    siteId: "",
};

async function startSkillHandler() {
    skills = await skillFileManager.loadSkills();

    return "Skill-Handler started";
}

function getSessionData() {
    return sessionData;
}

function handleSkill(skill, intent, slots, siteId, sessionId) {
    sessionData["siteId"] = siteId;
    sessionData["sessionId"] = sessionId;

    executeIntent(skill, intent, slots).then(console.log).catch(console.error);
}

function executeIntent(skill, intent, slots) {
    return new Promise((resolve, reject) => {
        try {
            const intentData = skillFileManager.getIntentData(skill, intent);
            const functionName = intentData["function"];

            const args = intentData["args"].map((parameterName) => {
                return slots.find((slot) => slot["slotName"] === `${skill}_${parameterName}`)["value"]["value"];
            });

            skills[skill][functionName].apply(this, args);

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
};

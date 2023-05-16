const { registerEventHandler, mqttPublish } = require("./mqttClient");
const skillHandler = require("./skillHandler");
const gsk = require("gecko-skillkit");

async function startHermesAdapter() {
    registerEventHandler("hermes/intent/#", hermesHandler);

    gsk.setConfigData({
        sayFunction: ttsSay,
    });

    return "Hermes-Adapter connected";
}

function hermesHandler(topic, message) {
    const [skill, intent] = topic.match(/(.*?\/.*?\/)(.+)_(.*?)$/is).slice(2);
    const { siteId, slots, sessionId } = message;

    skillHandler.handleSkill(skill, intent, slots, siteId, sessionId);
}

function ttsSay(text = "") {
    const { sessionId, siteId } = skillHandler.getSessionData();

    const message = {
        text: text,
        siteId: siteId,
        sessionId: sessionId,
    };

    mqttPublish("hermes/ttsSay", JSON.stringify(message));
}

module.exports = {
    startHermesAdapter,
    ttsSay,
};

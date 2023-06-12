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
const { registerEventHandler, mqttPublish } = require("./mqttClient");
const skillHandler = require("./skillHandler");
const gsk = require("gecko-skillkit");
const { printLog } = require("./utilityFunctions");

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

    printLog(text);
    mqttPublish("hermes/tts/say", JSON.stringify(message));
}

module.exports = {
    startHermesAdapter,
    ttsSay,
};

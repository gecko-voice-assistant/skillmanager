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
const mqtt = require("mqtt");
const gsk = require("gecko-skillkit");
let client;
const handlerMap = {
    default: () => {},
};

async function startMQTTClient(mqttHost = "127.0.0.1", mqttPort = "1883") {
    client = await mqtt.connect(`mqtt://${mqttHost}:${mqttPort}`);

    client.on("connect", () => {
        client.on("message", (topic, message) => {
            let handlerToTopic;

            for (let topicInHandleMap in handlerMap) {
                if (handlerToTopic) continue;

                if (topic.startsWith(topicInHandleMap.split("#")[0])) handlerToTopic = handlerMap[topicInHandleMap];
            }

            (handlerToTopic ? handlerToTopic : handlerMap["default"])(topic, JSON.parse(message.toString()));
        });
    });

    gsk.setConfigData({
        mqttPublishFunction: mqttPublish,
        mqttSubscribeFunction: registerEventHandler
    });

    return "Connected to MQTT-Host";
}

function registerEventHandler(topic = "", handler) {
    if (typeof topic === "string" && typeof handler === "function" && client) {
        client.subscribe(topic);

        handlerMap[topic] = handler;
    }
}

function mqttPublish(topic = "", message = "") {
    client.publish(topic, message);
}

module.exports = {
    startMQTTClient,
    registerEventHandler,
    mqttPublish,
};

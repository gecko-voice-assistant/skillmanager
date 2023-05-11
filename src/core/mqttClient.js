const mqtt = require("mqtt");
let client;
const handlerMap = {
    "default": () => {
    }
}

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
        })
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
    startMQTTClient, registerEventHandler, mqttPublish
}
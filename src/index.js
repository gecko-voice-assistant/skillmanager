const {startAPI} = require("./core/api");
const {startMQTTClient} = require("./core/mqttClient");
const {startHermesAdapter} = require("./core/hermesAdapter");
const {startSkillHandler} = require("./core/skillHandler");

init().catch(console.error)

async function init() {
    [
        await startMQTTClient("192.168.178.120"),
        await startHermesAdapter(),
        await startSkillHandler(),
        await startAPI(3000)
    ].forEach((msg) => console.log(msg));
}
const { startAPI } = require("./core/api");
const { startMQTTClient } = require("./core/mqttClient");
const { startHermesAdapter } = require("./core/hermesAdapter");
const { startSkillHandler } = require("./core/skillHandler");
const { printError, printLog, readFromConfigFile } = require("./core/utilityFunctions");
const { startRhasspyAdapter } = require("./core/rhasspyAdapter");

const mainConfig = readFromConfigFile("main");

init().catch(printError);

async function init() {
    [
        await startMQTTClient(mainConfig["mqttHost"] || "127.0.0.1", mainConfig["mqttPort"] || "1883"),
        await startHermesAdapter(),
        await startSkillHandler(),
        await startRhasspyAdapter(mainConfig["rhasspy"] || "http://127.0.0.1:12101"),
        await startAPI(mainConfig["apiPort"] || 3000),
    ].forEach((msg) => printLog(msg));
}

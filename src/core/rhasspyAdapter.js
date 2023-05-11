const axios = require("axios");
const {readFromConfigFile} = require("./utilityFunctions");
const rhasspyPath = readFromConfigFile("main")["rhasspy"] || "http://127.0.0.1:12101";

async function postToRhasspyAPI(endpoint = "", body = {}) {
  return await axios.post(`${rhasspyPath}${endpoint}`, body, {});
}

async function trainRhasspy() {
  return await postToRhasspyAPI("/api/train", {});
}

function postSlots() {

}

function postIntents() {

}

module.exports = {
  trainRhasspy, postSlots, postIntents
}
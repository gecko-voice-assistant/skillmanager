const { readLocaleFile, setSkillProperty, loadSkills } = require("../core/skillFileManager");
const { readFromConfigFile, printError } = require("../core/utilityFunctions");
const { registerSkill, unregisterSkill } = require("../core/rhasspyAdapter");
const router = require("express").Router();

router.get("/details", (req, res) => {
    const { description, intents, slots } = readLocaleFile(req["skillId"]);
    const { version, active } = readFromConfigFile("skills")["skills"][req["skillId"]] || {};

    res.send({
        description: description || "",
        intents: intents || [],
        slots: slots || [],
        version: version || "",
        active: active || false,
    });
});

router.get("/activate", async (req, res) => {
    let status = 200;
    let msg = "";
    try {
        msg = (await registerSkill(req["skillId"]))["data"];
        setSkillProperty(req["skillId"], "active", true);
        await loadSkills();
    } catch (err) {
        setSkillProperty(req["skillId"], "active", false);
        msg = err.toString();
        status = 500;
        printError(err);
    } finally {
        res.status(status).json({ message: msg });
    }
});

router.get("/deactivate", async (req, res) => {
    let status = 200;
    let msg = "";
    try {
        msg = (await unregisterSkill(req["skillId"]))["data"];
        setSkillProperty(req["skillId"], "active", false);
        await loadSkills();
    } catch (err) {
        setSkillProperty(req["skillId"], "active", true);
        msg = err.toString();
        status = 500;
        printError(err);
    } finally {
        res.status(status).json({ message: msg });
    }
});

router.post("/options", (req, res) => {
    res.json(req.body);
});

module.exports = router;

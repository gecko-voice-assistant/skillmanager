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
const {
    readLocaleFile,
    setSkillProperty,
    loadSkills,
    deleteSkill,
    getSkillOptions,
} = require("../core/skillFileManager");
const { readFromConfigFile, printError, filterObject } = require("../core/utilityFunctions");
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
        options: getSkillOptions(req["skillId"]),
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

router.get("/delete", async (req, res) => {
    let status = 200;
    let msg = "";
    try {
        await unregisterSkill(req["skillId"]);
        setSkillProperty(req["skillId"], "active", false);
        msg = await deleteSkill(req["skillId"]);
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
    let result = {};
    let code = 200;

    try {
        const changeableOptions = getSkillOptions(req["skillId"]);
        const changes = filterObject(req.body, (value, key) => Object.keys(changeableOptions).includes(key));
        let newOptions = {};

        for (let i in changes) {
            // if (typeof changeableOptions[i]["value"] !== typeof changes[i]["value"]) continue;
            newOptions[i] = changes[i]["value"];
        }

        setSkillProperty(req["skillId"], "options", newOptions);
    } catch (err) {
        printError(err);
        code = 500;
    } finally {
        res.status(code).json(result);
    }
});

module.exports = router;

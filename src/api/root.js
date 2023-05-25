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
const { readFromConfigFile, printError } = require("../core/utilityFunctions");
const { readLocaleFile } = require("../core/skillFileManager");
const router = require("express").Router();

router.get("/", (req, res) => {
    res.send("hello World!");
});

router.get("/skills", (req, res) => {
    const config = readFromConfigFile("skills");

    let skills = [];
    for (let i in config["skills"]) {
        let skill = config["skills"][i];
        skill["name"] = i;
        skills.push(skill);
    }

    try {
        res.json(
            skills.map((skill) => {
                const localeData = readLocaleFile(skill["name"]) || {};
                return {
                    name: skill["name"] || "",
                    description: localeData["description"] || "",
                    version: skill["version"] || "1.0",
                    active: skill["active"],
                };
            })
        );
    } catch (err) {
        printError(err);
        res.status(500).json({});
    }
});

router.post("/restart", (req, res) => {
    // todo implement restart
    res.json({});
});

module.exports = router;

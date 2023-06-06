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
const axios = require("axios");
const admZip = require("adm-zip");
const { readFromConfigFile, printError, filterObject } = require("../core/utilityFunctions");
const { setSkillProperty } = require("../core/skillFileManager");
const router = require("express").Router();

router.get("/list", (req, res) => {
    const mainConfig = readFromConfigFile("main") || {};
    const path = `${mainConfig["skillserver"] || "https://skillserver.fwehn.de"}/skills/${
        mainConfig["language"] || "en_US"
    }`;

    axios
        .get(path)
        .then((response) => {
            let installableSkills = filterObject(response.data, (skill) => skill["versions"].length > 0);
            const installedSkills = readFromConfigFile("skills")["skills"];

            for (let i in installableSkills) {
                installableSkills[i]["installed"] =
                    installedSkills[i] && installedSkills[i]["version"] ? installedSkills[i]["version"] : "";
            }

            res.status(200).json({ skills: installableSkills });
        })
        .catch((err) => {
            printError(err);
            res.status(500).json({ message: err.toString() });
        });
});

router.get("/:skillId/:versionTag", (req, res) => {
    const mainConfig = readFromConfigFile("main") || {};
    const path = `${mainConfig["skillserver"] || "https://skillserver.fwehn.de"}/download/${req.params["skillId"]}/${
        req.params["versionTag"]
    }`;

    axios
        .get(path, {
            responseType: "arraybuffer",
        })
        .then((response) => {
            const zip = new admZip(response.data);
            zip.extractAllTo(`${__dirname}/../skills/${req.params["skillId"]}`, true);
            setSkillProperty(req.params["skillId"], "version", req.params["versionTag"]);
            res.status(200).json({
                message: `Skill ${req.params["skillId"]} installed with version ${req.params["versionTag"]}`,
            });
        })
        .catch((err) => {
            printError(err);
            res.status(500).json({ message: err.toString() });
        });
});

module.exports = router;

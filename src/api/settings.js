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
const { readFromConfigFile, filterObject, writeToConfigFile, printError } = require("../core/utilityFunctions");
const router = require("express").Router();
const changeableSettings = ["skillserver", "language", "mqttHost", "mqttPort", "rhasspy"];

router.get("/", (req, res) => {
    const config = readFromConfigFile("main");

    res.json({
        version: "",
        settings: filterObject(config, (value, key) => changeableSettings.includes(key)),
    });
});

router.post("/", (req, res) => {
    let result = {};
    let code = 200;

    try {
        const changes = filterObject(req.body, (value, key) => changeableSettings.includes(key));
        let config = readFromConfigFile("main");

        for (let i in changes) {
            if (typeof config[i] !== typeof changes[i]) continue;
            config[i] = changes[i];
        }

        writeToConfigFile(config, "main");
    } catch (err) {
        printError(err);
        code = 500;
    } finally {
        res.status(code).json(result);
    }
});

module.exports = router;

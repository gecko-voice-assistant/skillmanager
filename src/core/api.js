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
const express = require("express");
const app = express();
const router = express.Router();
const bodyParser = require("body-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const zip = require("express-easy-zip");

app.use(
    fileUpload({
        createParentPath: true,
    })
);
app.use(zip());
app.use(bodyParser.json());
app.use(cors());

app.use(
    "",
    (req, res, next) => {
        next();
    },
    router
);

const rootRouter = require("../api/root");
router.use("/", rootRouter);

const skillRouter = require("../api/skill");
router.use(
    "/skill/:skillId",
    (req, res, next) => {
        req["skillId"] = req.params["skillId"];
        next();
    },
    skillRouter
);

const downloadRouter = require("../api/download");
router.use("/download", downloadRouter);

const installRouter = require("../api/install");
router.use("/install", installRouter);

const settingsRouter = require("../api/settings");
router.use("/settings", settingsRouter);

function startAPI(port = 3000) {
    return new Promise((resolve, reject) => {
        try {
            app.listen(port, () => resolve(`Listening on: http://127.0.0.1:${port}`));
        } catch (err) {
            reject(err);
        }
    });
}

module.exports = {
    startAPI,
};

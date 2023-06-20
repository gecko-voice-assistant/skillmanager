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
const router = require("express").Router();
const admZip = require("adm-zip");
const { setSkillProperty } = require("../core/skillFileManager");

router.post("/:skillId/:versionTag", (req, res) => {
    const skillName = req.params["skillId"];
    const versionTag = req.params["versionTag"];
    const skillData = req.files.zipped.data;

    let zip = new admZip(skillData);
    zip.extractAllTo(`${__dirname}/../skills/${skillName}/${versionTag}`, true);
    setSkillProperty(skillName, "version", versionTag);

    res.status(200).json({
        message: `Skill ${skillName} installed with version ${versionTag}`,
    });
});

module.exports = router;

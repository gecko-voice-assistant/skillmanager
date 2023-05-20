const axios = require("axios");
const admZip = require("adm-zip");
const { readFromConfigFile, printError } = require("../core/utilityFunctions");
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
            res.status(200).json({ skills: response.data });
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

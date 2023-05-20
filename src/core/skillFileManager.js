const fs = require("fs");
const path = require("path");
const { readFromConfigFile, asyncFilter } = require("../core/utilityFunctions");
const { exec } = require("child_process");
const { writeToConfigFile, printError } = require("./utilityFunctions");

function readLocaleFile(skillName) {
    try {
        const config = readFromConfigFile("skills");
        const locale = config["language"];
        const version = config["skills"][skillName]["version"];

        return JSON.parse(
            fs
                .readFileSync(path.join(__dirname, "..", "skills", skillName, version, "locales", `${locale}.json`))
                .toString()
        );
    } catch (err) {
        printError(err);
        return {};
    }
}

function getIntentData(skill, intent) {
    return readLocaleFile(skill)["intents"][intent];
}

function readPackageFile(pathToPackage) {
    return JSON.parse(fs.readFileSync(path.join(pathToPackage, "package.json")).toString());
}

function setSkillProperty(skillName, key, value) {
    let config = readFromConfigFile("skills") || {};
    let skillConfig = config["skills"] || [];
    let skill = skillConfig[skillName] || { name: skillName, version: "", active: false };

    skill[key] = value;
    skillConfig[skillName] = skill;
    config["skills"] = skillConfig;
    writeToConfigFile(config, "skills");
}

async function loadSkills() {
    const config = readFromConfigFile("skills");

    let skills = [];
    for (let i in config["skills"]) {
        let skill = config["skills"][i];
        skill["name"] = i;
        skills.push(skill);
    }

    let skillsToLoad = await asyncFilter(skills, async (skill) => {
        if (skill["active"]) {
            const locales = await new Promise((resolve) => {
                fs.readdir(
                    path.join(__dirname, "..", "skills", skill["name"], skill["version"], "locales"),
                    (err, files) => {
                        if (err) {
                            printError(err);
                            resolve([]);
                        } else {
                            resolve(files.map((filename) => path.parse(filename).name));
                        }
                    }
                );
            });

            return locales.includes(config["language"]);
        }
        return false;
    });

    const rootPath = path.join(__dirname, "..");
    const skillPaths = skillsToLoad.map((skill) => path.join("skills", skill["name"], skill["version"], "src"));

    const installed =
        (await new Promise((resolve, reject) => {
            exec(`npm install ${skillPaths.join(" ")}`, { cwd: rootPath }, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        }).catch(printError)) || false;

    let loadedSkills = {};
    if (installed) {
        for (let i in skillsToLoad) {
            loadedSkills[skillsToLoad[i]["name"]] = require(readPackageFile(skillPaths[i])["name"]);
        }
    }

    return loadedSkills;
}

module.exports = {
    readLocaleFile,
    setSkillProperty,
    getIntentData,
    loadSkills,
};

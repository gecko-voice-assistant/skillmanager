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
const fs = require("fs");
const path = require("path");
const { readFromConfigFile, asyncFilter } = require("../core/utilityFunctions");
const { exec } = require("child_process");
const { writeToConfigFile, printError, printLog } = require("./utilityFunctions");
const rootPath = path.join(__dirname, "..");

let activeSkills = {};

function getActiveSkills() {
    return activeSkills;
}

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

    const skillPaths = skillsToLoad.map((skill) => path.join(".", "skills", skill["name"], skill["version"], "src"));

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

    activeSkills = loadedSkills;
}

async function deleteSkill(skillName) {
    let uninstalled = true;

    let skillConfig = readFromConfigFile("skills");
    const skillsList = skillConfig["skills"];
    const packageName = readPackageFile(path.join(".", "skills", skillName, skillsList[skillName]["version"], "src"))[
        "name"
    ];

    if (activeSkills[skillName]) {
        uninstalled =
            (await new Promise((resolve, reject) => {
                exec(`npm uninstall ${packageName}`, { cwd: rootPath }, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(true);
                    }
                });
            }).catch(printError)) || false;
    }

    if (uninstalled) {
        setSkillProperty(skillName, "active", false);
        await loadSkills();

        delete skillConfig["skills"][skillName];
        writeToConfigFile(skillConfig, "skills");

        fs.rmSync(path.join(".", "skills", skillName), { recursive: true, force: true });
        return `Skill deleted successfully: ${skillName}`;
    }

    throw new Error(`Skill could not be removed: ${skillName}`);
}

function getSkillOptions(skillName) {
    try {
        let values = {};

        const config = readFromConfigFile("skills");
        const {version, options = {}} = config["skills"][skillName];
        const defaults = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "skills", skillName, version, "manifest.json")).toString())["options"];

        for (let i in defaults){
            values[i] = {
                "name": defaults[i]["name"],
                "type": defaults[i]["type"],
                "value": options[i] || defaults[i]["default"],
                "choices": defaults[i]["choices"] || []
            };
        }

        return values;
    } catch (err) {
        printError(err);
        return {};
    }
}

module.exports = {
    getActiveSkills,
    readLocaleFile,
    setSkillProperty,
    getIntentData,
    loadSkills,
    deleteSkill,
    getSkillOptions
};

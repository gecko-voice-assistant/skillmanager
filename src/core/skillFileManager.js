const fs = require("fs");
const path = require("path");
const { readFromConfigFile, asyncFilter } = require("../core/utilityFunctions");
const { exec } = require("child_process");

function readLocaleFile(skillName) {
    try {
        const config = readFromConfigFile("skills");
        const locale = config["language"];
        const { name, version } = config["skills"].find((skill) => skill.name === skillName);

        return JSON.parse(
            fs.readFileSync(path.join(__dirname, "..", "skills", name, version, "locales", `${locale}.json`)).toString()
        );
    } catch (err) {
        console.error(err);
        return {};
    }
}

function getIntentData(skill, intent) {
    return readLocaleFile(skill)["intents"][intent];
}

function readPackageFile(pathToPackage) {
    return JSON.parse(fs.readFileSync(path.join(pathToPackage, "package.json")).toString());
}

async function loadSkills() {
    const config = readFromConfigFile("skills");
    let skillsToLoad = await asyncFilter(config["skills"], async (skill) => {
        if (skill["active"]) {
            const locales = await new Promise((resolve) => {
                fs.readdir(
                    path.join(__dirname, "..", "skills", skill["name"], skill["version"], "locales"),
                    (err, files) => {
                        if (err) {
                            console.error(err);
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
        }).catch(console.error)) || false;

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
    getIntentData,
    loadSkills,
};

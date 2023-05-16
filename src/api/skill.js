const { readLocaleFile } = require('../core/skillFileManager');
const { readFromConfigFile } = require('../core/utilityFunctions');
const { registerSkill, unregisterSkill } = require('../core/rhasspyAdapter');
const router = require('express').Router();

router.get('/details', (req, res) => {
    const { description, intents, slots } = readLocaleFile(req['skillId']);
    const { version, active } = readFromConfigFile('skills')['skills'].find(
        (skill) => skill.name === req['skillId']
    );

    res.send({
        description: description || '',
        intents: intents || [],
        slots: slots || [],
        version: version || '',
        active: active || false,
    });
});

router.get('/activate', (req, res) => {
    let status = 200;
    let data = {};

    registerSkill(req['skillId'])
        .then((msg) => {
            data['message'] = msg['data'];
        })
        .catch((err) => {
            console.error(err);
            data['message'] = err;
            status = 500;
        })
        .finally(() => res.status(status).json(data));
});

router.get('/deactivate', (req, res) => {
    let status = 200;
    let data = {};

    unregisterSkill(req['skillId'])
        .then((msg) => {
            data['message'] = msg['data'];
        })
        .catch((err) => {
            console.error(err);
            data['message'] = err;
            status = 500;
        })
        .finally(() => res.status(status).json(data));
});

router.post('/options', (req, res) => {
    res.json(req.body);
});

module.exports = router;

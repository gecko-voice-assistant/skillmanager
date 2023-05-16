const { readFromConfigFile } = require('../core/utilityFunctions');
const { readLocaleFile } = require('../core/skillFileManager');
const router = require('express').Router();

router.get('/', (req, res) => {
    res.send('hello World!');
});

router.get('/skills', (req, res) => {
    const skills = readFromConfigFile('skills')['skills'];

    try {
        res.json(
            skills.map((skill) => {
                const localeData = readLocaleFile(skill['name']) || {};
                return {
                    name: skill['name'] || '',
                    description: localeData['description'] || '',
                    version: skill['version'] || '1.0',
                    active: skill['active'],
                };
            })
        );
    } catch (err) {
        console.error(err);
        res.status(500).json({});
    }
});

router.post('/restart', (req, res) => {
    // todo implement restart
    res.json({});
});

module.exports = router;

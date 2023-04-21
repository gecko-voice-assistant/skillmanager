const router = require("express").Router();

router.get("/details", (req, res) => {
    res.send(req["skillId"]);
});

router.get("/activate", (req, res) => {
    res.send(`Activating ${req["skillId"]}...`);
});

router.get("/deactivate", (req, res) => {
    res.send(`Deactivating ${req["skillId"]}...`);
});

router.post("/options", (req, res) => {
    res.json(req.body);
});

module.exports = router;
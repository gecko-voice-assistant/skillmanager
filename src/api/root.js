const router = require("express").Router();

router.get("/", (req, res) => {
    res.send("hello World!");
});

router.post("/restart", (req, res) => {
    // todo implement restart
    res.json({});
});

module.exports = router;
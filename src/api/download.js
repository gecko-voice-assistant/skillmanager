const router = require("express").Router();

router.get("/list", (req, res) => {
    res.json([{skillName: "HelloWorld", versions: ["0.1"], installed: false}]);
});

router.get("/:skillId/:versionTag", (req, res) => {
    res.json({
        skillId: req.params["skillId"],
        versionTag: req.params["versionTag"]
    });
});

module.exports = router;
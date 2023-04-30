const router = require("express").Router();
const {exec} = require("child_process");

router.get("/", (req, res) => {
    res.send("hello World!");
});

router.post("/restart", (req, res) => {
    // todo fix
    res.json({});

    // exec("npm restart dev", (err) => {
    //     if (err) console.error(err);
    //
    //     res.send("Done");
    // }, "inherit", "inherit");
});

module.exports = router;
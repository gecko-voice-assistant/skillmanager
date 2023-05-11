const router = require("express").Router();

router.get("/", (req, res) => {
    res.send("hello World!");
});

router.get("/skills", (req, res) => {
    res.json([
        {
            name: "GetTime",
            description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusantium alias aliquam blanditiis consequatur debitis dignissimos eius est id inventore ipsum itaque natus nisi officia officiis omnis perferendis praesentium quae quas quasi soluta tenetur ullam velit, voluptatum? Animi ea modi mollitia numquam officia quae quis sed similique temporibus vel voluptas, voluptatibus!",
            version: "1.0",
            active: true
        },
        {
            name: "GetWeather",
            description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusantium alias aliquam blanditiis consequatur debitis dignissimos eius est id inventore ipsum itaque natus nisi officia officiis omnis perferendis praesentium quae quas quasi soluta tenetur ullam velit, voluptatum? Animi ea modi mollitia numquam officia quae quis sed similique temporibus vel voluptas, voluptatibus!",
            version: "1.0",
            active: true
        },
        {
            name: "Zigbee2MQTT",
            description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusantium alias aliquam blanditiis consequatur debitis dignissimos eius est id inventore ipsum itaque natus nisi officia officiis omnis perferendis praesentium quae quas quasi soluta tenetur ullam velit, voluptatum? Animi ea modi mollitia numquam officia quae quis sed similique temporibus vel voluptas, voluptatibus!",
            version: "1.0",
            active: true
        }
    ]);
});

router.post("/restart", (req, res) => {
    // todo implement restart
    res.json({});
});

module.exports = router;
const express = require("express");
const router = express.Router();

router.route("/").get((req, res) => {
    res.send("Hello World using Router");
});

module.exports = router;

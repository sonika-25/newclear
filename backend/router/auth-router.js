const express = require("express");
const router = express.Router();
const { home, register } = require("../controllers/auth-controlller");

// router.route("/").get((req, res) => {
//     res.send("Hello World using Router");
// });
router.route("/").get(home);
router.route("/register").post(register);
router.route("/register").get(register);

module.exports = router;

require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// authenticates token by making sure it has not been tampered with
function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    // since header is in the form "Bearer TOKEN", we can access token via the first index
    const token = authHeader && authHeader.split(" ")[1];
    if (token == null) {
        return res.sendStatus(401);
    }

    // verify this token to make sure it isn't tampered with
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }
        // valid token
        req.user = user;
        next();
    });
}

// encrypts password by hashing it with a salt
async function encryptPassword(password, res) {
    try {
        // encrypt password
        const salt = await bcrypt.genSalt();
        return await bcrypt.hash(password, salt);
    } catch (error) {
        res.status(500).json({ error: error.message });
        return;
    }
}

module.exports = { authenticateToken, encryptPassword };

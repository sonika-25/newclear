require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./model/user-model");
const RefreshToken = require("./model/refresh-token-model.js");

const app = express();
const connectDB = require("./utils/db.js");

connectDB();

// Middleware which executes during lifecycle of a request
app.use(express.json());
app.use(
    cors({
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    }),
);

// generates a new access token using the refresh token,
// effectively refreshing the access token
app.post("/users/token", async (req, res) => {
    const refreshToken = req.body.token;
    if (refreshToken == null) {
        return res.sendStatus(401);
    }
    // is the refresh token found in the database
    try {
        const isFound = await RefreshToken.findOne({
            refreshToken: refreshToken,
        });
        if (!isFound) {
            return res.sendStatus(403);
        }
        // check that refresh token has not been tampered with
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            async (err, payload) => {
                if (err) {
                    return res.sendStatus(403);
                }
                // generate a new access token (refreshing the access token)
                // if refresh token is valid
                user = await User.findById(payload._id);
                // user not found or id not provided
                if (!user) {
                    return res.sendStatus(403);
                }
                const userObject = user.toObject();
                delete userObject.password;
                const accessToken = generateAccessToken(userObject);
                return res.json({ accessToken: accessToken });
            },
        );
    } catch (err) {
        return res.sendStatus(500);
    }
});

// signs the user out of their account
// by deleting the user's refresh token
app.delete("/users/signout", async (req, res) => {
    const refreshToken = req.body.token;
    // no refresh token given
    if (!refreshToken) {
        return res.sendStatus(400);
    }

    try {
        // try to remove refresh token from database
        const deletedToken = await RefreshToken.findOneAndDelete({
            refreshToken: refreshToken,
        });
        // no refresh token found
        if (!deletedToken) {
            return res.sendStatus(403);
        }
        // token has been removed, meaning successfully signed out
        res.sendStatus(204);
    } catch (err) {
        console.error("Error during signout:", err);
        res.sendStatus(500);
    }
});

// signs the user into their account
// by granting their access to access and refresh tokens
app.post("/users/signin", async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const user = await User.findOne({ email });
    if (user == null) {
        return res.status(400).json({ error: "Cannot find user" });
    }
    try {
        match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(400).json({ message: "Password is wrong" });
        }

        const userObject = user.toObject();
        delete userObject.password;

        // JSON web token which keeps track of user information without leaking password once logged in
        const accessToken = generateAccessToken(userObject);
        const refreshToken = jwt.sign(
            userObject,
            process.env.REFRESH_TOKEN_SECRET,
        );
        // try to store refresh tokens
        const existingRefreshToken = await RefreshToken.findOne({
            userId: user._id,
        });
        // one already exists for this user, so make room for a new one to replace it
        if (existingRefreshToken) {
            await RefreshToken.deleteOne({ userId: user._id });
        }

        // store refresh token in database
        const newRefreshToken = new RefreshToken({
            userId: user._id,
            refreshToken: refreshToken,
        });
        try {
            await newRefreshToken.save();
        } catch (err) {
            res.status(500).json({ error: "Error saving refresh token" });
        }

        return res.json({
            message: "Successful login",
            user: userObject,
            accessToken: accessToken,
            refreshToken: refreshToken,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// generates an access token which eventually expires
function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "30s",
    });
}

PORT = 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

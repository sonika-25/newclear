require("dotenv").config();

const User = require("../model/user-model");
const RefreshToken = require("../model/refresh-token-model");
const express = require("express");
const app = express();
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { hasPermission, checkPermission } = require("./permission");
const { authenticateToken, encryptPassword } = require("./authentication");

router.get("/profile", authenticateToken, async (req, res) => {
    res.json(req.user);
});

router.get("/:email", async (req, res) => {
    try {
        const { email } = req.params;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// creates an account for a user
router.post("/signup", async (req, res) => {
    isAdmin = false;
    let {
        username,
        firstName,
        lastName,
        role,
        email,
        phone,
        password,
        patients,
    } = req.body;
    if (!email || !phone || !password) {
        // client error
        return res.status(400).json({ message: "Please fill all the fields" });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: "User already exists" });
    }

    // encrypt password
    const originalPassword = password;
    password = await encryptPassword(originalPassword, res);
    try {
        // create new user entry
        const user = new User({
            username,
            firstName,
            lastName,
            role,
            email,
            phone,
            password,
            patients,
            isAdmin,
        });
        await user.save();
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// updates the details of the user
router.patch("/:id", authenticateToken, getUser, async (req, res) => {
    const userEditId = req.params.id;
    const currentUser = req.user;
    // ensure that only the logged in user has permission to edit the user themselves
    if (currentUser && currentUser._id === userEditId) {
        await editUser(req, res);
    }
});

// deletes the user account
router.delete("/:id", authenticateToken, getUser, async (req, res) => {
    const userEditId = req.params.id;
    const currentUser = req.user;
    // ensure that only the logged in user has permission to delete the user themselves
    if (
        currentUser &&
        hasPermission(currentUser, "manage:ownUser") &&
        currentUser._id === userEditId
    ) {
        try {
            await res.user.deleteOne();
            res.json({ message: "Deleted User" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
});

// generates a new access token using the refresh token,
// effectively refreshing the access token
router.post("/token", async (req, res) => {
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
router.delete("/signout", async (req, res) => {
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
router.post("/signin", async (req, res) => {
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
        // refresh token expires every 30 days to ensure that if it gets leaked,
        // the refresh token will eventually provide no use
        const refreshToken = jwt.sign(
            userObject,
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn: "30d",
            },
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
        expiresIn: "60m",
    });
}

// edits user details
async function editUser(req, res) {
    if (req.body.username != null) {
        res.user.username = req.body.username;
    }

    if (req.body.firstName != null) {
        res.user.firstName = req.body.firstName;
    }

    if (req.body.lastName != null) {
        res.user.lastName = req.body.lastName;
    }

    if (req.body.email != null) {
        res.user.email = req.body.email;
    }

    if (req.body.role != null) {
        res.user.role = req.body.role;
    }

    if (req.body.phone != null) {
        res.user.phone = req.body.phone;
    }

    if (req.body.password != null) {
        res.user.password = await encryptPassword(req.body.password, res);
    }

    try {
        const updatedUser = await res.user.save();
        res.json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// finds the user with a given id and adds it to the response
async function getUser(req, res, next) {
    let user;
    try {
        user = await User.findById(req.params.id);
        if (user == null) {
            return res.status(404).json({ message: "Cannot find user" });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }

    res.user = user;
    next();
}

// returns the user with matching id and role
async function getUserWithRole(id, role) {
    let user = await User.findById(req.params.id);
    if (user && user.role && user.role === role) {
        return user;
    }
    return null;
}

module.exports = router;

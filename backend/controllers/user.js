require("dotenv").config();

const User = require("../model/user-model");
const express = require("express");
const app = express();
const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { hasPermission, checkPermission } = require("./permission");
const { authenticateToken, encryptPassword } = require("./authentication.js");

router.get("/profile", authenticateToken, async (req, res) => {
    res.json(req.user);
});

router.get("/:email", async (req, res) => {
    try {
        const email = decodeURIComponent(req.params.email);
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

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

router.patch("/:id", authenticateToken, getUser, async (req, res) => {
    const userEditId = req.params.id;
    const currentUser = req.user;
    // checks whether the logged in user has permission to edit the user with a given id
    if (
        currentUser &&
        (hasPermission(currentUser, "update:user") ||
            (hasPermission(currentUser, "update:ownUser") &&
                currentUser._id === userEditId) ||
            hasPermission(currentUser, "add:organisation"))
    ) {
        await editUser(req, res);
    }
});

router.delete("/:id", authenticateToken, getUser, async (req, res) => {
    const userEditId = req.params.id;
    const currentUser = req.user;
    // checks whether the logged in user has permission to edit the user with a given id
    if (
        currentUser &&
        (hasPermission(currentUser, "delete:user") ||
            (hasPermission(currentUser, "delete:ownUser") &&
                currentUser._id === userEditId))
    ) {
        try {
            await res.user.deleteOne();
            res.json({ message: "Deleted User" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
});

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

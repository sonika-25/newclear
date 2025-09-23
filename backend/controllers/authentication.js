const User = require("../model/user-model");
const express = require("express");
const bcrypt = require("bcrypt");
const app = express();
const router = require("express").Router();

router.get("/", async (req, res) => {
    User.find({}).then((data) => {
        res.json(data);
    });
});

router.get("/:email", async (req, res) => {
    User.find((user) => user.email === req.params.email).then((data) => {
        res.json(data);
    });
});

router.post("/signup", async (req, res) => {
    isAdmin = false;
    let { firstName, lastName, email, phone, password, patients } = req.body;
    if (!firstName || !lastName || !email || !phone || !password) {
        // client error
        return res.status(400).json({ message: "Please fill all the fields" });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: "User already exists" });
    }

    // encrypt password
    const originalPassword = password;
    password = await encryptPassword(originalPassword);
    try {
        // create new user entry
        const user = new User({
            firstName,
            lastName,
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

router.post("/signin", async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const user = await User.findOne({ email });
    if (user == null) {
        return res.status(400).json({ error: "Cannot find user" });
    }
    try {
        match = await bcrypt.compare(password, user.password);
        if (match) {
            res.send("Successful login");
        } else {
            res.send("Password is wrong");
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.patch("/:id", getUser, async (req, res) => {
    if (req.body.firstName != null) {
        res.user.firstName = req.body.firstName;
    }

    if (req.body.lastName != null) {
        res.user.lastName = req.body.lastName;
    }

    if (req.body.email != null) {
        res.user.email = req.body.email;
    }

    if (req.body.phone != null) {
        res.user.phone = req.body.phone;
    }

    if (req.body.password != null) {
        res.user.password = await encryptPassword(req.body.password);
    }

    try {
        const updatedUser = await res.user.save();
        res.json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete("/:id", getUser, async (req, res) => {
    try {
        await res.user.deleteOne();
        res.json({ message: "Deleted User" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

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

async function encryptPassword(password) {
    try {
        // encrypt password
        const salt = await bcrypt.genSalt();
        return await bcrypt.hash(password, salt);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = router;

const User = require("../model/user-model");
const express = require("express");
const bcrypt = require("bcrypt");
const app = express();
const router = require("express").Router();

router.get("/:email", async (req, res) => {
    User.find((user) => user.email === req.params.email).then((data) => {
        res.json(data);
    });
});

router.post("/signin", async (req, res) => {
    isAdmin = false;
    let { username, role, org_id, email, phone, password, patients } = req.body;
    if (!username || !email || !phone || !password) {
        // client error
        return res.status(400).json({ message: "Please fill all the fields" });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: "User already exists" });
    }

    try {
        // encrypt password
        const salt = await bcrypt.genSalt();
        const originalPassword = password;
        password = await bcrypt.hash(originalPassword, salt);
        try {
            // create new user entry
            const user = new User({
                username,
                role,
                org_id,
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
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/signin", async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const user = User.find((user) => user.email === email);
    if (user == null) {
        return res.status(400).json({ error: "Cannot find user" });
    }
    try {
        if (bcrypt.compare(password, user.password)) {
            res.send("Successful login"); 
        } else {
            res.send("Username or password is wrong");
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

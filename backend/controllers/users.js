const User = require("../model/user-model");
const express = require("express");
const app = express();
const router = require("express").Router();

router.get("/", async (req, res) => {
    User.find({}).then((data) => {
        res.json(data);
    });
});

router.post("/", async (req, res) => {
    const { username, email, phone, password } = req.body;
    if (!username || !email || !phone || !password) {
        // client error
        return res.status(400).json({ message: "Please fill all the fields" });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: "User already exists" });
    }
    try {
        isAdmin = false;
        const user = new User({
            username,
            role,
            org_id,
            email,
            phone,
            password,
            isAdmin,
        });
        await user.save();
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;

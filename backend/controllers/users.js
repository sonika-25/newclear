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
    isAdmin = false;
    const { username, role, org_id, email, phone, password, patients } =
        req.body;
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
        const hashedPassword = await bcrypt.hash(password, salt);
        // create new user entry
        const user = new User({
            username,
            role,
            org_id,
            email,
            phone,
            hashedPassword,
            patients,
            isAdmin,
        });
        await user.save();
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;

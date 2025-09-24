const Organization = require("../model/org-model");
const express = require("express");
const app = express();
const router = require("express").Router();

router.post("/create-org", async(req,res) => {
    try {
        const { username, email, phone, password } = req.body;
        if (!username || !email || !phone || !password) {
        return res.status(400).json({ message: "All fields are required" });
        }

        const newOrg = new Organization({
        username,
        email,
        phone,
        password,
        });

        const savedOrg = await newOrg.save();
        res.status(201).json(savedOrg);
  } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
  }
});
module.exports = router;

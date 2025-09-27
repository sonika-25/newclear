const Organization = require("../model/org-model");
const express = require("express");
const app = express();
const router = require("express").Router();


// sign in and register for organization
router.post("/signup", async (req, res) => {
    isAdmin = false;
    let { username, email, phone, password, patients } = req.body;
    if (!username || !email || !phone || !password) {
        // client error
        return res.status(400).json({ message: "Please fill all the fields" });
    }
    const orgExists = await Organization.findOne({ email });
    if (orgExists) {
        return res.status(400).json({ message: "Organization already exists" });
    }

    // encrypt password
    const originalPassword = password;
    password = await encryptPassword(originalPassword);
    try {
        // create new org entry
        const org = new Organization({
            username,
            email,
            phone,
            password,
            patients,
            isAdmin,
        });
        await org.save();
        res.status(201).json(org);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post("/signin", async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const org = await Organization.findOne({ email });
    if (org == null) {
        return res.status(400).json({ error: "Cannot find Organization" });
    }
    try {
        match = await bcrypt.compare(password, org.password);
        if (match) {
            res.send("Successful login");
        } else {
            res.send("Password is wrong");
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// edit organization
router.patch("/:id", getOrganization, async (req, res) => {
    if (req.body.firstName != null) {
        res.org.firstName = req.body.firstName;
    }

    if (req.body.lastName != null) {
        res.org.lastName = req.body.lastName;
    }

    if (req.body.email != null) {
        res.org.email = req.body.email;
    }

    if (req.body.phone != null) {
        res.org.phone = req.body.phone;
    }

    if (req.body.password != null) {
        res.org.password = await encryptPassword(req.body.password);
    }

    try {
        const updatedOrganization = await res.org.save();
        res.json(updatedOrganization);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete("/:id", getOrganization, async (req, res) => {
    try {
        await res.org.deleteOne();
        res.json({ message: "Deleted org" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


//simple getter using ID
async function getOrganization(req, res, next) {
    let org;
    try {
        org = await Organization.findById(req.params.id);
        if (org == null) {
            return res.status(404).json({ message: "Cannot find Organization" });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }

    res.org = org;
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

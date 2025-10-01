const Organization = require("../model/org-model");
const Patient = require("../model/patient-model");
const Family = require("../model/family-model");
const express = require("express");
const bcrypt = require("bcrypt");
const app = express();
const router = require("express").Router();

//sign up and sign in for Family
router.post("/signup", async (req, res) => {
    isAdmin = false;
    let { firstName, lastName, email, phone, password, patients } = req.body;
    if (!firstName || !lastName || !email || !phone || !password) {
        // client error
        return res.status(400).json({ message: "Please fill all the fields" });
    }
    const famExists = await Family.findOne({ email });
    if (famExists) {
        return res.status(400).json({ message: "family already exists" });
    }

    // encrypt password
    const originalPassword = password;
    password = await encryptPassword(originalPassword, res);
    try {
        // create new Family entry
        const fam = new Family({
            firstName,
            lastName,
            email,
            phone,
            password,
            patients,
            isAdmin,
        });
        await fam.save();
        res.status(201).json(fam);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post("/signin", async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const fam = await Family.findOne({ email });
    if (fam == null) {
        return res.status(400).json({ error: "Cannot find family member" });
    }
    try {
        match = await bcrypt.compare(password, fam.password);
        if (match) {
            res.send("Successful login");
        } else {
            res.send("Password is wrong");
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.patch("/:id", getFamily, async (req, res) => {
    if (req.body.firstName != null) {
        res.fam.firstName = req.body.firstName;
    }

    if (req.body.lastName != null) {
        res.fam.lastName = req.body.lastName;
    }

    if (req.body.email != null) {
        res.fam.email = req.body.email;
    }

    if (req.body.phone != null) {
        res.fam.phone = req.body.phone;
    }

    if (req.body.password != null) {
        res.fam.password = await encryptPassword(req.body.password, res);
    }

    try {
        const updatedFam = await res.fam.save();
        res.json(updatedFam);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete("/:id", getFamily, async (req, res) => {
    try {
        await res.fam.deleteOne();
        res.json({ message: "Deleted Family" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

async function getFamily(req, res, next) {
    let fam;
    try {
        fam = await Family.findById(req.params.id);
        if (fam == null) {
            return res.status(404).json({ message: "Cannot find Family" });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }

    res.fam = fam;
    next();
}

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

//add organization to patient
//(add invite code)
router.post("/addOrg", async (req, res) => {
    let { orgEmail, patientId } = req.body;
    try {
        //when scaling for more patients, check the family owns the patient.
        const org = await Organization.findOne ({"email": orgEmail})
        const orgId = org._id
        await Organization.updateOne(
            { _id: orgId },
            { $push: { patients: patientId } }
        );
        await Patient.updateOne({ _id: patientId }, { currentOrgId: orgId });
        res.status(200).json({
            message: "Organisation added to patient successfully",
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: "Failed to add organisation to patient",
        });
    }
});
//delete Org
//edit patient
//edit patient

router.post("/patient/add-patient/:userId", async (req, res) => {
    try {
        let { username, email, phone, password } = req.body; //details of patient
        let userId = req.params.userId; //userId of family
        const patient = new Patient({
            username: username,
            email: email,
            phone: phone,
            password: await encryptPassword(password, res),
            familyId : userId
        });
        const newPatient = await patient.save();
        const patid = await newPatient._id;
        const fam = await Family.findOne({ _id: userId });
        console.log(fam);
        await Family.updateOne({ _id: userId }, { $push: { patients: patid } });
        res.status(201).json(newPatient);
    } catch (err) {
        console.log(err);
    }
});

module.exports = router;

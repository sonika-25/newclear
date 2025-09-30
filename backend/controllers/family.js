const Organization = require("../model/org-model");
const Patient = require("../model/patient-model");
const Family = require("../model/family-model");
const express = require("express");
const bcrypt = require("bcrypt");
const app = express();
const router = require("express").Router();
const { authenticateToken } = require("./authentication.js");
const { checkPermission } = require("./permission.js");

//add organization to patient
//(add invite code)
router.post(
    "/addOrg",
    authenticateToken,
    checkPermission("add:organisation"),
    async (req, res) => {
        let { orgId, patientId, famId } = req.body;
        try {
            //when scaling for more patients, check the family owns the patient.
            await Organization.updateOne(
                { _id: orgId },
                { $push: { patients: patientId } },
            );
            await Patient.updateOne(
                { _id: patientId },
                { currentOrgId: orgId },
            );
            res.status(200).json({
                message: "Organisation added to patient successfully",
            });
        } catch (err) {
            console.log(err);
            res.status(500).json({
                error: "Failed to add organisation to patient",
            });
        }
    },
);
//delete Org
//edit patient
//edit patient

router.post(
    "/patient/add-patient/:userId",
    authenticateToken,
    checkPermission("create:patient"),
    async (req, res) => {
        try {
            let { username, email, phone, password } = req.body; //details of patient
            let userId = req.params.userId; //userId of family
            const patient = new Patient({
                username: username,
                email: email,
                phone: phone,
                password: await encryptPassword(password, res),
            });
            const newPatient = await patient.save();
            const patid = await newPatient._id;
            const fam = await Family.findOne({ _id: userId });
            console.log(fam);
            await Family.updateOne(
                { _id: userId },
                { $push: { patients: patid } },
            );
            res.status(201).json(newPatient);
        } catch (err) {
            console.log(err);
        }
    },
);

module.exports = router;

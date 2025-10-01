/*const Patient = require("../model/patient-model");
const express = require("express");
const Family = require("../model/family-model");
const app = express();
const router = require("express").Router();

router.get("/users/:email/patients", async(req,res) => {
    try {
        const user = await User.findById(req.params.email)
        .populate("patients")
            //select: "username email phone currentOrg family tasks", - selective sendback if needed?
        if (!user) return res.status(404).json({ message: "User not found" });
        return res.json(user.patients || []);
  } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
  }
})

router.get("/patients/:patientId", async(req,res) => {
    try {
        const patient = await Patient.findById(req.params.patientId)
        .populate("tasks")        
        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
    }
    res.json(patient);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
})

router.get("/patient/tasks/:patientId", async (req, res) => {
    try {
        const patient = await Patient.findOne({ _id: req.params.patientId })
            .populate("tasks"); 
        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }
        res.json(patient.tasks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/patient/add-patient/:userId" , async(req,res) => {
    try {
        let {username, email,phone,password} = req.body
        let userId = req.params.userId
        const patient = new Patient({
            "username": username,
            "email" : email,
            "phone": phone,
            "password" : password
        })
        const newPatient = await patient.save();
        const patid = await newPatient._id
        const fam = await User.findOne({ "_id" : userId})
        console.log (fam)
        await User.updateOne (
            {"_id" : userId},
            { $push: { "patients": patid }}
        )
        res.status(201).json(newPatient);
    }
    catch (err){
        console.log(err)
    }
})

module.exports = router;
 */
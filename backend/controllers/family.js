const Organization = require("../model/org-model");
const Patient = require("../model/patient-model");
const express = require("express");
const app = express();
const router = require("express").Router();

router.post("/addOrg", async(req,res) => {
    let {orgId, patientId} = req.body;
    try {
        //check it's family adding it.
        //org = Organization.find({orgId})
        //patient = Patient.find ({patientId})
        await Organization.updateOne (
            {"_id" : orgId},
            { $push: { "patients": patientId }}
        )
        await Patient.updateOne (
            {"_id" : patientId},
            { "currentOrgId": orgId}
        )
    }
    catch (err){console.log(err)}
    
})

module.exports = router;

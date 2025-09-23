const User = require("../model/user-model");
const Schedule = require("../model/schedule-model");
const express = require("express");
const bcrypt = require("bcrypt");
const app = express();
const router = require("express").Router();
const crypto = require('crypto');

router.post("/create", async (req, res) => {

    let {scheduleAuthor, resident_name, schedule_id, schedule_password} = req.body;
    if (!scheduleAuthor || !resident_name || !schedule_id 
        || !schedule_password) {
            //client error
            return res.status(400).json({message: "Please fill in all the fields!"});
    }

    // Only one created schedule per user at this stage
    const authorExists = await Schedule.findOne({scheduleAuthor: scheduleAuthor});
    if (authorExists) {
        return res.status(400).json({message: "User has already created a schedule."});
    }

    
    try {
        // encrypt schedule password
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(schedule_password, salt);
        schedule_password = hashedPassword;

        // create an invite token
        const inviteToken = crypto.randomBytes(16).toString('hex');

        try {
            // Create a new schedule entry
            const schedule = new Schedule({

                scheduleAuthor, 
                resident_name, 
                schedule_id, 
                schedule_password,
                inviteToken
            });

            await schedule.save();
            const inviteLink = `/schedules/join/${inviteToken}`;
            res.status(201).json(schedule, inviteLink);
        } catch (error) {
            res.status(400).json({error: error.message});
        }
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

// router.get("/data", async(req, res) => {

        

// }); 


module.exports = router;
const User = require("../model/user-model");
const Schedule = require("../model/schedule-model");
const express = require("express");
const bcrypt = require("bcrypt");
const app = express();
const router = require("express").Router();
const crypto = require('crypto');

router.post("/create", async (req, res) => {

    let {scheduleAuthor, resident_name, schedule_id} = req.body;
    if (!scheduleAuthor || !resident_name || !schedule_id ) {
        //client error
        return res.status(400).json({message: "Please fill in all the fields!"});
    }   

    // Only one created schedule per user at this stage
    const authorExists = await Schedule.findOne({scheduleAuthor: scheduleAuthor});
    if (authorExists) {
        return res.status(400).json({message: "User has already created a schedule."});
    }

    
    try {

        // create an invite token
        const inviteToken = crypto.randomBytes(16).toString('hex');

        try {
            // Create a new schedule entry
            const schedule = new Schedule({

                scheduleAuthor, 
                resident_name, 
                schedule_id, 
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

router.get("/schedule-info", async(req, res) => {

    const inputAuthor = req.body.scheduleAuthor;
    const inputResident = req.body.resident_name;

    Schedule.findOne({scheduleAuthor: inputAuthor
        , resident_name: inputResident}).then((data) => {res.json(data); });

}); 


// Add a user to a schedule 
router.post("/add-user", async(req, res) => {

    // User should provide scheduleID, their userID, and rhe user they want to add
    const {scheduleID, authorID, addedUser} = req.body;

    const givenSchedule = await Schedule.findOne({_id: scheduleID});
    if (!givenSchedule) {
        return res.status(400).json({message: "The provided schedule does not exist!"});
    }

    // Check that author is really the author of the given schedule
    if (authorID !=  givenSchedule.scheduleAuthor.toString()) {

        return res.status(400).json({message: "You do not have access to add users to this schedule"});
    }

    // Try to add user
    try {

        // Check that the user to be added exists
        const userExists = await User.findById(addedUser);
        if (!userExists) {
            return res.status(400).json({ message: "User to be added does not exist!" });
        }

        // Check that the user is not already in the schedule
        if (givenSchedule.schedule_users.includes(addedUser)) {
            return res.status(400).json({message: "User is already added to this schedule!"});
        }

        givenSchedule.schedule_users.push(addedUser);
        await givenSchedule.save();
        res.status(201).json(givenSchedule);

    } catch (error) {
        res.status(400).json({error: error.message});
    }

    
});


module.exports = router;
const User = require("../model/user-model");
const Schedule = require("../model/schedule-model");
const Task = require("../model/task-model");
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

// Add a task to a schedule
router.post("/add-task", async(req, res) => {

    // User should provide scheduleID, their userID, and rhe user they want to add
    const {scheduleID, authorID} = req.body;

    let givenSchedule = await Schedule.findOne({_id: scheduleID});
    if (!givenSchedule) {
        return res.status(400).json({message: "The provided schedule does not exist!"});
    }

    // Check that author is really the author of the given schedule
    if (authorID !=  givenSchedule.scheduleAuthor.toString()) {

        return res.status(400).json({message: "You do not have access to add tasks to this schedule"});
    }

    // Try to add task - causing error
    try {
        const addedTask = await createTask(req, res);

        if (addedTask == null) {
            throw new Error("addedTask is undefined");
        }

        givenSchedule.tasks.push(addedTask);
        await givenSchedule.save();
        res.status(201).json(givenSchedule);

    } catch (error) {
        res.status(400).json({error: error.message});
    }

    

});

async function createTask(req) {
    
    let {task, description, frequency, interval, budget, isCompleted} = req.body;
    // Create the task
    console.log(task);
    console.log(description);
    console.log(frequency);
    console.log(interval);
    console.log(budget);
    console.log(isCompleted);

    if (!task || !description || !frequency || !interval || !budget 
        || isCompleted == null) {

        throw new Error("Please fill in all the fields!");
    }

    const addedTask = new Task({task, description, frequency, interval, budget
        , isCompleted});
    if (addedTask == null) {
        throw new Error("addedTask is undefined");
    }
    await addedTask.save();
    return addedTask;

}


// Add a user to a schedule 
router.post("/add-user", async(req, res) => {

    // User should provide scheduleID, their userID, and rhe user they want to add
    const {scheduleID, authorID, addedUser} = req.body;

    let givenSchedule = await Schedule.findOne({_id: scheduleID});
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

router.delete("/remove-user", async(req, res) => {

    const {scheduleID, authorID, removedUser} = req.body;

    let givenSchedule = await Schedule.findOne({_id: scheduleID});
    if (!givenSchedule) {
        return res.status(400).json({message: "The provided schedule does not exist!"});
    }

    // Check that author is really the author of the given schedule
    if (authorID !=  givenSchedule.scheduleAuthor.toString()) {

        return res.status(400).json({message: "You do not have access to remove users from this schedule"});
    }

    // Try to remove the user
    try {
        // Check that the user is not already in the schedule
        if (!givenSchedule.schedule_users.includes(removedUser)) {
            return res.status(400).json({message: "User is already not in this schedule!"});
        }

        let index = givenSchedule.schedule_users.indexOf(removedUser);
        if ( index > -1) {
            givenSchedule.schedule_users.splice(index, 1);
        }
        
        //await givenSchedule.updateOne({_id: scheduleID}, {$pull: {schedule_users: removedUser}});
        await givenSchedule.save();
        res.status(200).json(givenSchedule);

    } catch (error) {
        res.status(400).json({error: error.message});
    }
});


module.exports = router;
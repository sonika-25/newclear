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

async function findSchedule(scheduleID, res) {

    const givenSchedule = await Schedule.findById(scheduleID);
    if (!givenSchedule) {
        res.status(400).json({message: "The provided schedule does not exist!"});
        return null;
    }

    return givenSchedule;
}

async function verifyScheduleAuthor(givenSchedule, scheduleAuthor, res) {

    // Check that author is really the author of the given schedule
    if (scheduleAuthor !=  givenSchedule.scheduleAuthor.toString()) {

        res.status(400).json({message: "You do not have access to perform this action!"});
        return false;
    }

    return true;
}

// Add a task to a schedule
router.post("/add-task", async(req, res) => {

    // User should provide scheduleID, their userID, and rhe user they want to add
    const {scheduleID, authorID} = req.body;

    const givenSchedule = findSchedule(scheduleID, res);
    if (!givenSchedule) {return;}

    // Check that author is really the author of the given schedule
    if (!verifyScheduleAuthor(givenSchedule, authorID, res)) {return;}

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

    let givenSchedule = findSchedule(scheduleID, res);
    if (!givenSchedule) {return;}

    // Check that author is really the author of the given schedule
    if (!verifyScheduleAuthor(givenSchedule, authorID, res)) {return;}

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

router.delete("/remove-task", async(req, res) => {

    const {scheduleID, authorID, removedTask} = req.body;

    let givenSchedule = findSchedule(scheduleID, res);
    if (!givenSchedule) {return;}

    // Check that author is really the author of the given schedule
    if (!verifyScheduleAuthor(givenSchedule, authorID, res)) {return;}


    // Try to remove the task
    try {
        // Check that the task is not already in the schedule
        if (!givenSchedule.tasks.includes(removedTask)) { 
            return res.status(400).json({message: "Task is already not in this schedule!"});
        }

        let index = givenSchedule.tasks.indexOf(removedTask);
        if ( index > -1) {
            givenSchedule.tasks.splice(index, 1);
        }

        // Task might as well be deleted from database too
        await Task.deleteOne({removedTask});

        await givenSchedule.save();
        res.status(200).json(givenSchedule);

    } catch (error) {
        res.status(400).json({error: error.message});
    }
});

router.delete("/remove-user", async(req, res) => {

    const {scheduleID, authorID, removedUser} = req.body;

    let givenSchedule = findSchedule(scheduleID, res);
    if (!givenSchedule) {return;}

    // Check that author is really the author of the given schedule
    if (!verifyScheduleAuthor(givenSchedule, authorID, res)) {return;}

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

        
        await givenSchedule.save();
        res.status(200).json(givenSchedule);

    } catch (error) {
        res.status(400).json({error: error.message});
    }
});


// Delete a schedule from the system and database
router.delete("/remove", async(req, res) => {

    const {scheduleID, authorID} = req.body;
    let givenSchedule = findSchedule(scheduleID, res);
    if (!givenSchedule) {return;}

    // Check that author is really the author of the given schedule
    if (!verifyScheduleAuthor(givenSchedule, authorID, res)) {return;}

    try {

        await Schedule.findByIdAndDelete(scheduleID);
        res.status(200).json({message: "Schedule has been successfully removed!"});
    } catch (error) {
        res.status(400).json({error: error.message});
    }
});

module.exports = router;
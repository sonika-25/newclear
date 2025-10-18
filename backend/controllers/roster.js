const Roster = require("../model/roster-model");
const express = require("express");
const Schedule = require("../model/schedule-model");
const ScheduleUser =  require("../model/schedule-user-model");
const router = express.Router();
const { addByUnit } = require("../utils/dates");

router.patch("/:id", async (req, res) => {

    const rosterId = req.params.id;
    const roster = await Roster.findById(rosterId);
    let {day, shift, carerId} = req.body;

    if (!day || !shift || !carerId) {
        return res.status(400).json({message: "Please fill in all the fields!"});
    }

    const carer = await ScheduleUser.findById(carerId);
    if (!carer) {
        // Carer does not exist
        return res.status(400).json({message: `This carer does not exist in 
            this schedule!`});
    }

    if ((roster.schedule).toString() != (carer.schedule).toString()) {

        return res.status(400).json({message: "This carer does not belong " + 
            "to this schedule!"});
    }

    try {

        roster.days[day][shift] = carer.user; 
        await roster.save();
        return res.status(201).json(roster);
    } catch (err) {
        res.status(500).json({error: "Server error"})
    }

});

router.post("/create", async (req, res) => {

    const scheduleId = req.body.schedule;
    const weekStartString = req.body.weekStart;

    try {
        const newRoster = await createRoster(scheduleId, weekStartString);
        return res.status(201).json(newRoster);
    } catch (err) {
        res.status(400).json({message: err.message});
    }
    

});

router.get("/fetch", async (req, res) => {

    const {scheduleId} = req.query;

    const scheduleExists = await Schedule.findById(scheduleId);
    if (!scheduleExists) {
        return res.status(400).json({message: "This schedule does not exist!"});
    }

    try {

        const roster = await Roster.findOne({schedule: scheduleId});
        if (!roster) {
            weekStartString = (new Date()).toString();
            const newRoster = await createRoster(scheduleId, weekStartString);
            return res.status(201).json(newRoster);
        }

        // Logic for resetting the roster for a new week
        const weekStart = roster.weekStart;
        const currentDate = new Date();
        var daysSinceMonday;
        if (currentDate.getDay() == 0) { // If it is a sunday
            daysSinceMonday = 6;
        } else {
            daysSinceMonday = currentDate.getDay() - 1;
        } 
        const mostRecentMonday = new Date();
        mostRecentMonday.setDate(mostRecentMonday.getDate() - daysSinceMonday);
        mostRecentMonday.setHours(0, 0, 0, 0); // set to midnight

        // If a reset is required
        if (weekStart.getTime() < mostRecentMonday.getTime()) {      

            const shiftKeys = ["morning", "afternoon", 'evening'];
            for (const day in roster.days) {
                for (const shift in shiftKeys) {
                    roster.days[day][shift] = null;
                } 

            }
            roster.weekStart = mostRecentMonday;
        }
        
        await roster.save();
        return res.status(200).json(roster);
    } catch (err) {
        res.status(400).json({err: err.message});
    }
});

async function createRoster(scheduleId, weekStartString) {

    const weekStart = new Date(weekStartString);
 
    // Check if roster for that week already exists
    const roster = await Roster.findOne({schedule: scheduleId
        , weekStart: weekStart});
    if (roster) {
        throw new Error("A roster for this week already exists!")
    }

    const newRoster = new Roster({schedule: scheduleId, weekStart});
    await newRoster.save();
    return newRoster;
}

 

module.exports = router;

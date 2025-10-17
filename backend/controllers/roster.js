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

        roster.days[day][shift] = carer;
        await roster.save();
        res.status(201).json(roster);
    } catch (err) {
        res.status(500).json({error: "Server error"})
    }

});

router.post("/create", async (req, res) => {

    const scheduleId = req.body.scheduleId;
    const weekStart = new Date(req.body.weekStart);

    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
        return res.status(400).json({message: "This schedule does not exist!"});
    }

    const currentDate = new Date();
    // console.log("current date: " + currentDate);
    if (currentDate.getTime() > weekStart.getTime()) {
        return res.status(400).json({message: "This week has already passed!"});
    }

    try {

        // Check if roster for that week already exists
        const roster = Roster.findOne({scheduleId: scheduleId
            , weekStart: weekStart});
        if (roster) {
            return res.status(400).json({message: "A roster for this week " + 
                "already exists!"});
        }

        const newRoster = new Roster({schedule, weekStart});
        await newRoster.save();
        res.status(201).json(newRoster);

    } catch (err) {
        res.status(500).json({err: err.message});
    }

});

router.get("/rosters", async (req, res) => {

    const {scheduleId, weekStart} = req.query;

    const scheduleExists = await Schedule.findById(scheduleId);
    if (!scheduleExists) {
        return res.status(400).json({message: "This schedule does not exist!"});
    }

    const currentDate = new Date();
    if (currentDate.getTime() < weekStart.getTime()) {
        return res.status(400).json({message: "This week has already passed!"});
    }

    try {

        const roster = await Roster.findOne({schedule: scheduleId
            , weekStart: weekStart});
        if (!roster) {
            return res.status(400).json({message: "There is no roster for " + 
                "this week!"});
        }
        res.json(roster);
    } catch (err) {
        res.status(500).json({err: "Server error"});
    }
});

module.exports = router;

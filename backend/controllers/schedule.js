const User = require("../model/user-model");
const Schedule = require("../model/schedule-model");
const ScheduleUser = require("../model/schedule-user-model");
const Task = require("../model/task-model");
const express = require("express");
const bcrypt = require("bcrypt");
const app = express();
const router = require("express").Router();
const crypto = require("crypto");
const { authenticateToken } = require("./authentication.js");
const {
    getRequiredPerm,
    hasPermission,
    checkPermission,
} = require("./permission.js");

// Find all schedules associated with the current user
router.get("/schedules", authenticateToken, async (req, res) => {
    try {
        const schedules = await ScheduleUser.find({ user: req.user })
            .populate("schedule")
            .exec();
        return res.status(200).json(schedules);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// Find all users associated with the given schedule
router.get("/:scheduleId/users", authenticateToken, async (req, res) => {
    const { scheduleId } = req.params;
    try {
        const users = await ScheduleUser.find({ schedule: scheduleId })
            .populate("user")
            .exec();
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// Find the schedule-user relationship information
router.get("/:scheduleId/:userId", authenticateToken, async (req, res) => {
    const { scheduleId, userId } = req.params;
    try {
        const scheduleUser = await ScheduleUser.findOne({
            user: userId,
            schedule: scheduleId,
        });
        return res.status(200).json(scheduleUser);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

router.post("/create", authenticateToken, async (req, res) => {
    // Makes sure that the creation of schedule and scheduleUser is atomic,
    // if one fails, they both fail
    const session = await Schedule.startSession();
    session.startTransaction();

    let { scheduleAuthor, residentName } = req.body;
    if (!scheduleAuthor || !residentName) {
        return res
            .status(400)
            .json({ message: "Please fill in all the fields!" });
    }

    const currentUser = req.user;
    if (!currentUser) {
        return res.status(400).json({ message: "User is not logged in" });
    }

    // Only one created schedule per user at this stage
    const authorExists = await Schedule.findOne({
        scheduleAuthor: scheduleAuthor,
    });
    if (authorExists) {
        return res
            .status(400)
            .json({ message: "User has already created a schedule." });
    }

    try {
        // Create an invite token
        const inviteToken = crypto.randomBytes(16).toString("hex");

        // Create a new schedule entry
        const schedule = new Schedule({
            scheduleAuthor,
            residentName,
            inviteToken,
        });
        await schedule.save({ session });

        // Link the creator to the schedule as a family member
        const scheduleUser = new ScheduleUser({
            user: currentUser._id,
            schedule: schedule._id,
            role: "family",
        });
        await scheduleUser.save();
        await scheduleUser.populate("user");
        await scheduleUser.populate("schedule");

        await session.commitTransaction();
        const inviteLink = `/schedules/join/${inviteToken}`;
        res.status(201).json(schedule, inviteLink);
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ error: error.message });
    } finally {
        session.endSession();
    }
});

router.get("/schedule-info", async (req, res) => {
    const inputAuthor = req.body.scheduleAuthor;
    const inputResident = req.body.resident_name;

    Schedule.findOne({
        scheduleAuthor: inputAuthor,
        resident_name: inputResident,
    }).then((data) => {
        res.json(data);
    });
});

async function findSchedule(scheduleId, res) {
    const givenSchedule = await Schedule.findById(scheduleId);
    if (!givenSchedule) {
        res.status(400).json({
            message: "The provided schedule does not exist!",
        });
        return null;
    }

    return await givenSchedule;
}

async function verifyScheduleAuthor(givenSchedule, authorId, res) {
    // Check that author is really the author of the given schedule
    if (authorId != givenSchedule.scheduleAuthor.toString()) {
        res.status(400).json({
            message: "You do not have access to perform this action!",
        });
        return await false;
    }

    return await true;
}

// Add a task to a schedule
router.post("/:scheduleId/add-task", async (req, res) => {
    // User should provide scheduleID, their userID, and the task they want to add
    const { scheduleId } = req.params;
    const { authorId } = req.body;

    const givenSchedule = await findSchedule(scheduleId, res);
    if (!givenSchedule) {
        return;
    }

    console.log(givenSchedule);

    // Check that author is really the author of the given schedule
    if (!verifyScheduleAuthor(givenSchedule, authorId, res)) {
        return;
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
        res.status(400).json({ error: error.message });
    }
});

async function createTask(req) {
    let { task, description, frequency, interval, budget, isCompleted } =
        req.body;
    // Create the task

    if (
        !task ||
        !description ||
        !frequency ||
        !interval ||
        !budget ||
        isCompleted == null
    ) {
        throw new Error("Please fill in all the fields!");
    }

    const addedTask = new Task({
        task,
        description,
        frequency,
        interval,
        budget,
        isCompleted,
    });
    if (addedTask == null) {
        throw new Error("addedTask is undefined");
    }
    await addedTask.save();
    return addedTask;
}

// Add a user to a schedule
router.post("/:scheduleId/add-user", authenticateToken, async (req, res) => {
    // User should provide scheduleID, their userID, and rhe user they want to add
    const { scheduleId } = req.params;
    const { userId, role } = req.body;

    let givenSchedule = await findSchedule(scheduleId, res);
    if (!givenSchedule) {
        return;
    }

    const currentUser = req.user;
    // Try to add user
    try {
        // Check if the user has permission to add
        const requiredPermission = getRequiredPerm(role);
        if (
            !requiredPermission ||
            !(await hasPermission(currentUser, scheduleId, requiredPermission))
        ) {
            return res
                .status(403)
                .json({ message: "Not allowed to add user to schedule" });
        }

        // Check that the user to be added exists
        const userExists = await User.findById(userId);
        if (!userExists) {
            console.log("User does not exist:", userId);
            return res
                .status(400)
                .json({ message: "User to be added does not exist!" });
        }

        // Check that the user is not already in the schedule
        const userExistsInSchedule = await ScheduleUser.findOne({
            user: userId,
            schedule: scheduleId,
        });
        if (userExistsInSchedule) {
            console.log("User already in schedule:", userId);
            return res
                .status(400)
                .json({ message: "User is already added to this schedule!" });
        }

        // Add the new relationship between user and schedule
        const newScheduleUser = new ScheduleUser({
            user: userId,
            schedule: scheduleId,
            role,
        });
        await newScheduleUser.save();
        await newScheduleUser.populate("user");
        await newScheduleUser.populate("schedule");
        res.status(201).json(newScheduleUser);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.delete("/:scheduleId/remove-task", async (req, res) => {
    const { scheduleId } = req.params;
    const { authorId, removedTask } = req.body;

    let givenSchedule = await findSchedule(scheduleId, res);
    if (!givenSchedule) {
        return;
    }

    // Check that author is really the author of the given schedule
    if (!(await verifyScheduleAuthor(givenSchedule, authorId, res))) {
        return;
    }

    // Try to remove the task
    try {
        // Check that the task is not already in the schedule
        if (!givenSchedule.tasks.includes(removedTask)) {
            return res
                .status(400)
                .json({ message: "Task is already not in this schedule!" });
        }

        let index = givenSchedule.tasks.indexOf(removedTask);
        if (index > -1) {
            givenSchedule.tasks.splice(index, 1);
        }

        // Task might as well be deleted from database too
        await Task.deleteOne({ _id: removedTask });

        await givenSchedule.save();
        res.status(200).json(givenSchedule);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.delete(
    "/:scheduleId/remove-user",
    authenticateToken,
    async (req, res) => {
        const { scheduleId } = req.params;
        const { removedUser } = req.body;
        const currentUser = req.user;

        let givenSchedule = await findSchedule(scheduleId, res);
        if (!givenSchedule) {
            return;
        }

        // Try to remove the user
        try {
            // schedule-user relationship of current user
            const currentScheduleUser = await ScheduleUser.findOne({
                user: currentUser,
                schedule: scheduleId,
            });

            // schedule-user relationship of user we want to remove
            const tobeRemovedScheduleUser = await ScheduleUser.findOne({
                user: removedUser,
                schedule: scheduleId,
            });

            if (!currentScheduleUser || !tobeRemovedScheduleUser) {
                return res.status(404).json({
                    message: "Users cannot not be found in the schedule",
                });
            }

            const requiredPermission = getRequiredPerm(
                tobeRemovedScheduleUser.role,
            );

            if (!requiredPermission) {
                return res
                    .status(403)
                    .json({ message: "Cannot remove with this role" });
            }

            if (String(currentUser._id) === String(removedUser._id)) {
                return res.status(403).json({
                    message: "Cannot remove yourself from the schedule",
                });
            }

            const canDelete = await hasPermission(
                currentUser,
                scheduleId,
                requiredPermission,
            );
            if (!canDelete || currentUser === tobeRemovedScheduleUser.user) {
                return res.status(403).json({
                    message: "Cannot remove with this role",
                });
            }

            // Remove the link between the user and the schedule
            const removedScheduleUser = await ScheduleUser.findOneAndDelete({
                user: removedUser,
                schedule: scheduleId,
            });
            if (!removedScheduleUser) {
                return res
                    .status(400)
                    .json({ message: "User is already not in this schedule!" });
            }

            res.status(200).json({ message: "User removed successfully." });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
);

// Delete a schedule from the system and database
router.delete(
    "/:scheduleId",
    authenticateToken,
    checkPermission("delete:schedule"),
    async (req, res) => {
        const { scheduleId } = req.params;
        const { authorId } = req.body;
        let givenSchedule = await findSchedule(scheduleId, res);
        if (!givenSchedule) {
            console.log("No schedule found");
            return;
        }

        // Check that author is really the author of the given schedule
        if (
            !req.user ||
            !givenSchedule.scheduleAuthor ||
            req.user !== givenSchedule.scheduleAuthor
        ) {
            console.log("No author");
            return;
        }

        // Makes sure that the deletion of schedule and scheduleUser are atomic,
        // if any deletions fails, they all fail
        const session = await Schedule.startSession();
        session.startTransaction();
        try {
            await Schedule.findByIdAndDelete(scheduleId, { session });
            // Delete all schedule relationships
            (await ScheduleUser.deleteMany({ schedule: scheduleId }),
                { session });
            await session.commitTransaction();
            res.status(200).json({
                message: "Schedule has been successfully removed!",
            });
        } catch (error) {
            await session.abortTransaction();
            res.status(500).json({ error: error.message });
        } finally {
            session.endSession();
        }
    },
);

module.exports = router;

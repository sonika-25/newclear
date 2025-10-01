const User = require("../model/user-model");
const Schedule = require("../model/schedule-model");
const Task = require("../model/task-model");
const express = require("express");
const bcrypt = require("bcrypt");
const app = express();
const router = require("express").Router();
const crypto = require("crypto");
const { authenticateToken } = require("./authentication");
const {
    getRequiredPerm,
    hasPermission,
    checkPermission,
} = require("./permission.js");

router.post("/create", async (req, res) => {
    let { scheduleAuthor, resident_name, schedule_Id } = req.body;
    if (!scheduleAuthor || !resident_name || !schedule_Id) {
        return res
            .status(400)
            .json({ message: "Please fill in all the fields!" });
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
        // create an invite token
        const inviteToken = crypto.randomBytes(16).toString("hex");

        try {
            // Create a new schedule entry
            const schedule = new Schedule({
                scheduleAuthor,
                resident_name,
                schedule_Id,
                inviteToken,
            });

            await schedule.save();
            const inviteLink = `/schedules/join/${inviteToken}`;
            res.status(201).json(schedule, inviteLink);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
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

    // Try to add user
    try {
        // Check if the user has permission to add an organisation
        if (role === "organisation") {
            if (
                !(await hasPermission(
                    currentUser,
                    scheduleId,
                    "manage:organisation",
                ))
            ) {
                return res
                    .status(403)
                    .json({ message: "Not allowed to add organisation" });
            }
        }
        // Check if the user has permission to add a carer
        if (role === "carer") {
            if (
                !(await hasPermission(currentUser, scheduleId, "manage:carer"))
            ) {
                return res
                    .status(403)
                    .json({ message: "Not allowed to add carer" });
            }
        }
        // Check if the user has permission to add family
        if (role === "family" || role === "POA") {
            if (
                !(await hasPermission(currentUser, scheduleId, "manage:family"))
            ) {
                return res
                    .status(403)
                    .json({ message: "Not allowed to add family/POA" });
            }
        }

        // Check that the user to be added exists
        const userExists = await User.findById(userId);
        if (!userExists) {
            return res
                .status(400)
                .json({ message: "User to be added does not exist!" });
        }

        // Check that the user is not already in the schedule
        const userExistsInSchedule = await ScheduleUser.findOne({
            user: userId,
            schedule: scheduleId,
        });
        if (userExistsInSchedule)
            return res
                .status(400)
                .json({ message: "User is already added to this schedule!" });

        // Add the new relationship between user and schedule
        const newScheduleUser = new ScheduleUser({
            user: userId,
            schedule: scheduleId,
            role,
        });
        await newScheduleUser.save();
        res.status(201).json(newScheduleUser);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.delete("/:scheduleId/remove-task", async (req, res) => {
    const { scheduleId } = req.params;
    const { authorID, removedTask } = req.body;

    let givenSchedule = await findSchedule(scheduleId, res);
    if (!givenSchedule) {
        return;
    }

    // Check that author is really the author of the given schedule
    if (!verifyScheduleAuthor(givenSchedule, authorID, res)) {
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
        await Task.deleteOne({ removedTask });

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
        const { removedUserId } = req.body;
        const currentUser = req.user;

        let givenSchedule = await findSchedule(scheduleId, res);
        if (!givenSchedule) {
            return;
        }

        // Try to remove the user
        try {
            const currentRelationship = await ScheduleUser.findOne({
                user: currentUserId,
                schedule: scheduleId,
            });

            const toBeRemovedRelationship = await ScheduleUser.findOne({
                user: removedUserId,
                schedule: scheduleId,
            });

            if (!currentRelationship || !toBeRemovedRelationship) {
                return res.status(404).json({
                    message: "Users cannot not be found in the schedule",
                });
            }

            const requiredPermission = getRequiredPerm(
                toBeRemovedRelationship.role,
            );

            if (!requiredPermission) {
                res.status(403).json({ message: "Cannot remove this role" });
            }

            const canDelete = await hasPermission(
                currentUserId,
                scheduleId,
                requiredPermission,
            );
            if (!canDelete) {
                return res.status(403).json({
                    message: "Cannot remove this role",
                });
            }
            // Remove the link between the user and the schedule
            const removedRelationship = await ScheduleUser.findOneAndDelete({
                schedule: scheduleId,
                removedUser: removedUserId,
            });

            if (!removedRelationship) {
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
            return;
        }

        // Check that author is really the author of the given schedule
        if (
            !req.user ||
            !givenSchedule.scheduleAuthor ||
            req.user._id !== givenSchedule.scheduleAuthor._id
        ) {
            return;
        }

        try {
            await Schedule.findByIdAndDelete(scheduleId);
            // Delete all schedule relationships
            await ScheduleUser.deleteMany({ schedule: scheduleId });
            res.status(200).json({
                message: "Schedule has been successfully removed!",
            });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
);

module.exports = router;

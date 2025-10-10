const User = require("../model/user-model");
const Schedule = require("../model/schedule-model");
const ScheduleUser = require("../model/schedule-user-model");
const Task = require("../model/task-model");
const Category = require("../model/category-model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { authenticateToken } = require("./authentication.js");
const {
    getRequiredPerm,
    hasPermission,
    checkPermission,
} = require("./permission.js");

// Find all schedules associated with the current user
async function fetchUserSchedules(req, res) {
    try {
        const schedules = await ScheduleUser.find({ user: req.user._id })
            .populate("schedule")
            .exec();
        return res.status(200).json(schedules);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

// Find all users associated with the given schedule
async function fetchScheduleUsers(req, res) {
    const { scheduleId } = req.params;
    try {
        const users = await ScheduleUser.find({ schedule: scheduleId })
            .populate("user")
            .exec();
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

// Find the schedule-user relationship information
async function getUserSchedule(req, res) {
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
}

// Creates a schedule for the client/PWSN, with the creator becoming the client's family/POA
async function createSchedule(req, res) {
    // Makes sure that the creation of schedule and scheduleUser is atomic,
    // if one fails, they both fail
    const session = await Schedule.startSession();
    session.startTransaction();

    let { scheduleOwner, pwsnName } = req.body;
    if (!scheduleOwner || !pwsnName) {
        return res
            .status(400)
            .json({ message: "Please fill in all the fields!" });
    }

    const currentUser = req.user;
    if (!currentUser) {
        return res.status(400).json({ message: "User is not logged in" });
    }

    try {
        // Create an invite token
        const inviteToken = crypto.randomBytes(16).toString("hex");

        // Create a new schedule entry
        const schedule = new Schedule({
            scheduleOwner,
            pwsnName,
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
}

// Returns the information of a schedule belonging to a given owner and client/PWSN
async function getScheduleInfo(req, res) {
    const inputOwner = req.body.scheduleOwner;
    const inputPWSN = req.body.pwsn_name;

    Schedule.findOne({
        scheduleOwner: inputOwner,
        pwsn_name: inputPWSN,
    }).then((data) => {
        res.json(data);
    });
}

// Fetches the schedule with a given id
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

// Check that author is really the owner of the given schedule
async function verifyScheduleOwner(givenSchedule, authorId, res) {
    if (authorId != givenSchedule.scheduleOwner.toString()) {
        res.status(400).json({
            message: "You do not have access to perform this action!",
        });
        return await false;
    }

    return await true;
}

// Add a user to a schedule
async function addUser(req, res) {
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

        // live update everyone in the schedule when user is added
        const io = req.app.get("io");
        io.to(scheduleId).emit("userAdded", newScheduleUser);

        res.status(201).json(newScheduleUser);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// Removes a user from the schedule if the user has permission
async function removeUser(req, res) {
    const { scheduleId } = req.params;
    const { removedUser } = req.body;
    const currentUserId = req.user._id || req.user;
    const removedUserId = removedUser._id || removedUser;

    let session;
    // Try to remove the user
    try {
        let givenSchedule = await findSchedule(scheduleId, res);
        if (!givenSchedule) {
            return;
        }

        // cannot delete schedule owner
        if (String(removedUserId) === String(givenSchedule.scheduleOwner)) {
            return res
                .status(403)
                .json({ message: "Cannot remove the schedule owner" });
        }

        // schedule-user relationship of current user
        const currentScheduleUser = await ScheduleUser.findOne({
            user: currentUserId,
            schedule: scheduleId,
        });

        // schedule-user relationship of user we want to remove
        const tobeRemovedScheduleUser = await ScheduleUser.findOne({
            user: removedUserId,
            schedule: scheduleId,
        });

        if (!currentScheduleUser) {
            return res.status(404).json({
                message:
                    "You are not in the schedule, and will be redirected soon...",
            });
        }

        if (!tobeRemovedScheduleUser) {
            return res.status(404).json({
                message: "User cannot not be found in the schedule",
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

        if (String(currentUserId) === String(removedUserId)) {
            return res.status(403).json({
                message: "Cannot remove yourself from the schedule",
            });
        }

        const canDelete = await hasPermission(
            currentUserId,
            scheduleId,
            requiredPermission,
        );
        if (!canDelete) {
            return res.status(403).json({
                message: "Cannot remove with this role",
            });
        }

        // Makes sure that nothing is deleted if a single deletion fails
        session = await ScheduleUser.startSession();
        session.startTransaction();

        const removedRole = tobeRemovedScheduleUser.role;
        if (removedRole === "serviceProvider") {
            await removeOrgEmployees(scheduleId, session, req);
        }

        // Remove the link between the user and the schedule
        const removedScheduleUser = await ScheduleUser.findOneAndDelete({
            user: removedUserId,
            schedule: scheduleId,
        }).session(session);
        if (!removedScheduleUser) {
            return res
                .status(400)
                .json({ message: "User is already not in this schedule!" });
        }

        await session.commitTransaction();

        // live update everyone in the schedule when user is removed
        const io = req.app.get("io");
        await removedScheduleUser.populate("user");
        io.to(scheduleId).emit("userRemoved", removedScheduleUser);

        // updates on removed user's end
        io.to(String(removedUserId)).emit("removedFromSchedule", {
            scheduleId,
        });

        res.status(200).json({ message: "User removed successfully." });
    } catch (error) {
        if (session) {
            await session.abortTransaction();
        }
        res.status(500).json({ error: error.message });
    } finally {
        if (session) {
            session.endSession();
        }
    }
}

// Removes all managers and carers when an org is removed
async function removeOrgEmployees(scheduleId, session, req) {
    const removedEmployees = await ScheduleUser.find({
        schedule: scheduleId,
        role: { $in: ["manager", "carer"] },
    })
        .populate("user")
        .session(session);

    if (!removedEmployees.length) {
        return;
    }

    // Delete all managers and carers
    await ScheduleUser.deleteMany({
        schedule: scheduleId,
        role: { $in: ["manager", "carer"] },
    }).session(session);

    const io = req.app.get("io");
    // Live updates for each removed employee
    for (const employee of removedEmployees) {
        io.to(scheduleId).emit("userRemoved", employee);
        io.to(String(employee.user._id)).emit("removedFromSchedule", {
            scheduleId,
        });
    }

    return;
}

// Delete a schedule from the system and database
async function deleteSchedule(req, res) {
    const { scheduleId } = req.params;
    const userId = req.user._id || req.user;

    let givenSchedule = await findSchedule(scheduleId, res);
    if (!givenSchedule) {
        return res.status(404).json({ message: "No schedule found" });
    }

    // Check that the user is really the owner of the given schedule
    if (
        !req.user ||
        !givenSchedule.scheduleOwner ||
        String(userId) !== String(givenSchedule.scheduleOwner)
    ) {
        return res
            .status(400)
            .json({ message: "User is not the owner of the schedule" });
    }

    // Makes sure that the deletion of schedule and scheduleUser are atomic,
    // if any deletions fails, they all fail
    const session = await Schedule.startSession();
    session.startTransaction();
    try {
        const schedule = await Schedule.findById(scheduleId);
        // Delete all categories belonging to the schedule
        const categoryIds = schedule.categories || [];

        // Delete all tasks belonging to those categories
        if (categoryIds.length > 0) {
            const categories = await Category.find({
                _id: { $in: categoryIds },
            }).session(session);
            const allTaskIds = categories.flatMap((c) => c.tasks || []);
            if (allTaskIds.length > 0) {
                await Task.deleteMany({ _id: { $in: allTaskIds } }).session(
                    session,
                );
            }

            // Delete all categories linked to this schedule
            await Category.deleteMany({ _id: { $in: categoryIds } }).session(
                session,
            );
        }
        // Delete the schedule
        await Schedule.findByIdAndDelete(scheduleId).session(session);
        // Delete all schedule relationships
        await ScheduleUser.deleteMany({ schedule: scheduleId }).session(
            session,
        );
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
}

async function getCategory(req, res) {
    try {
        const scheduleId = req.params.scheduleId;

        if (
            !scheduleId ||
            scheduleId === "null" ||
            scheduleId === "undefined"
        ) {
            console.error("Invalid scheduleId received:", scheduleId);
            return res
                .status(400)
                .json({ error: "Invalid or missing scheduleId" });
        }
        const schedule = await Schedule.findById(scheduleId)
            .populate("categories")
            .exec(); // populate Category documents

        if (!schedule) {
            return res.status(404).json({ error: "Schedule not found" });
        }

        res.json(schedule.categories || []);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}

async function removeCategory(req, res) {
    try {
        const { scheduleId, categoryId } = req.params;

        // Remove category reference from schedule
        await Schedule.updateOne(
            { _id: scheduleId },
            { $pull: { categories: categoryId } },
        );

        // Delete the actual Category document
        await Category.findByIdAndDelete(categoryId);

        res.json({ message: "Category deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
}

async function addCategory(req, res) {
    try {
        const { name, budget } = req.body;
        const scheduleId = req.params.scheduleId;
        if (!name) {
            console.log("need a name");
            return;
        }
        const category = await Category.findOne({ name });

        let cat = new Category({
            name: name,
            budget: budget,
            scheduleId: scheduleId,
        });
        const newCat = await cat.save();

        await Schedule.updateOne(
            { _id: scheduleId },
            { $addToSet: { categories: newCat._id } },
        );

        res.status(201).json(newCat);
    } catch (err) {
        console.log(err);
    }
}

async function completeTask(req, res) {
    let { taskId, scheduleId } = req.body;
    let task = await Task.findOne({ taskId });
    if (task.isCompleted) {
        console.log("already done");
        return;
    }
    await Task.updateOne({ _id: taskId }, { $set: { isCompleted: true } });
    const amount = Number(task.budget || 0);

    const cat = await Category.findById(task.category).lean();
    const newBudget = Math.max(0, (cat.budget || 0) - amount);
    await Category.updateOne({ _id: cat._id }, { $set: { budget: newBudget } });

    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) return res.status(404).json({ error: "Schedule not found" });
    const newRemaining = Math.max(
        0,
        (patient.totalBudgetRemaining || 0) - amount,
    );
    await Schedule.updateOne(
        { _id: scheduleId },
        { $set: { totalBudgetRemaining: newRemaining } },
    );
}

async function addTask(req, res) {
    try {
        const { scheduleId } = req.params;
        const {
            task,
            description,
            frequency,
            interval,
            budget,
            categoryId,
            categoryName,
        } = req.body;

        // 1) Make sure patient exists
        const schedule = await Schedule.findById(scheduleId).lean();
        if (!schedule)
            return res.status(404).json({ error: "Schedule not found" });

        // 2) Resolve categoryId
        let resolvedCategoryId = categoryId || null;

        if (!resolvedCategoryId && categoryName) {
            // find-or-create category by name (global or you can scope per-org/family later)
            let category = await Category.findOne({
                name: categoryName,
                scheduleId,
            });
            //if (!category) {
            //    category = await Category.create({ name: categoryName, budget: 0 }); // or require budget in request
            //}
            resolvedCategoryId = category._id;
        }

        // 3) Create Task (isCompleted default = false recommended)
        const newTask = await Task.create({
            task,
            description,
            frequency, // ensure Task.frequency is type String with enum DAILY/WEEKLY/MONTHLY/YEARLY
            interval,
            budget,
            category: resolvedCategoryId || undefined,
            isCompleted: false, // add default in schema too
            assignedToCarer: null,
        });

        // 4) Attach to schedule.tasks
        await Schedule.updateOne(
            { _id: scheduleId },
            { $addToSet: { tasks: newTask._id } },
        );

        // Add task to category in this schedule
        if (resolvedCategoryId) {
            await Category.updateOne(
                { _id: resolvedCategoryId },
                { $addToSet: { tasks: newTask._id } },
            );
        }

        return res.status(201).json(newTask);
    } catch (e) {
        next(e);
    }
}

module.exports = {
    fetchUserSchedules,
    fetchScheduleUsers,
    getUserSchedule,
    createSchedule,
    getScheduleInfo,
    addUser,
    removeUser,
    deleteSchedule,
    getCategory,
    removeCategory,
    addCategory,
    completeTask,
    addTask,
};

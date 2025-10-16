const express = require("express");
const router = express.Router();
const scheduleCtrl = require("../controllers/schedule.js");
const { authenticateToken } = require("../controllers/authentication.js");
const {
    getRequiredPerm,
    hasPermission,
    checkPermission,
} = require("../controllers/permission.js");

// Find all schedules associated with the current user
router.get("/schedules", authenticateToken, scheduleCtrl.fetchUserSchedules);

// Find all users associated with the given schedule
router.get(
    "/:scheduleId/users",
    authenticateToken,
    scheduleCtrl.fetchScheduleUsers,
);
router.get("/catTasks/:catId", scheduleCtrl.getTasksInCat)

// Fetches all the categories belong to a specific schedule
router.get(
    "/:scheduleId/getCategories",
    authenticateToken,
    scheduleCtrl.getCategory,
);

// Find the schedule-user relationship information
router.get(
    "/:scheduleId/:userId",
    authenticateToken,
    scheduleCtrl.getUserSchedule,
);

// Creates a schedule for the client/PWSN, with the creator becoming the client's family/POA
router.post("/create", authenticateToken, scheduleCtrl.createSchedule);

// Returns the information of a schedule belonging to a given owner and client/PWSN
router.get("/schedule-info", scheduleCtrl.getScheduleInfo);

// Add a user to a schedule
router.post("/:scheduleId/add-user", authenticateToken, scheduleCtrl.addUser);

// Removes a user from the schedule if the user has permission
router.delete(
    "/:scheduleId/remove-user",
    authenticateToken,
    scheduleCtrl.removeUser,
);

// Delete a schedule from the system and database
router.delete(
    "/:scheduleId",
    authenticateToken,
    checkPermission("delete:schedule"),
    scheduleCtrl.deleteSchedule,
);

router.delete(
    "/:scheduleId/categories/:categoryId",
    authenticateToken,
    checkPermission("delete:category"),
    scheduleCtrl.removeCategory,
);

router.post(
    "/:scheduleId/add-category",
    authenticateToken,
    checkPermission("create:category"),
    scheduleCtrl.addCategory,
);

router.patch(
    "/:scheduleId/categories/:categoryId",
    authenticateToken,
    checkPermission("edit:category"),
    scheduleCtrl.editCategory,
);

router.post(
    "/:taskInsId/finish-task",
    authenticateToken,
    checkPermission("complete:task"),
    scheduleCtrl.completeTask,
);

router.post(
    "/:scheduleId/add-task",
    authenticateToken,
    checkPermission("create:task"),
    scheduleCtrl.addTask,
);

module.exports = router;

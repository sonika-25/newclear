const ScheduleUser = require("../model/schedule-user-model.js");

const ROLES = {
    family: [
        "manage:ownUser",
        "manage:provider",
        "manage:family",
        "delete:schedule",
        "create:task",
        "delete:task",
        "edit:task",
        "read:runs"

    ],
    POA: [
        "manage:ownUser",
        "manage:provider",
        "manage:family",
        "delete:schedule",
        "create:task",
        "delete:task",
        "edit:task",
        "read:runs"

    ],
    serviceProvider: [
        "manage:ownUser",
        "manage:manager",
        "manage:carer",
        "create:task",
        "delete:category",
        "create:category",
        "delete:task",
        "edit:category",
        "remove:org",
        "edit:task",
        "read:runs"
    ],
    manager: [
        "manage:ownUser",
        "manage:carer",
        "create:task",
        "delete:category",
        "create:category",
        "edit:category",
        "delete:task",
        "edit:task",
        "read:runs"

    ],
    carer: ["manage:ownUser", "upload:file", "complete:task"],
};

// check if the given user can perform an action
async function hasPermission(userId, scheduleId, permission) {
    // fetches the information of this user in the schedule
    const scheduleUser = await ScheduleUser.findOne({
        user: userId,
        schedule: scheduleId,
    }).lean();
    if (!scheduleUser) {
        return false;
    }

    const role = scheduleUser.role;
    if (!role) {
        return false;
    }

    // family has admin privileges when there are no service providers
    if (role === "family" || role === "POA") {
        const serviceProviderExists = await ScheduleUser.exists({
            schedule: scheduleId,
            role: "serviceProvider",
        });

        if (!serviceProviderExists) {
            return true;
        }
    }

    return ROLES[role].includes(permission);
}

// check if current user has permission
function checkPermission(permission) {
    return async (req, res, next) => {
        const userId = req.user._id;
        const scheduleId = req.params.scheduleId;
        if (!userId || !scheduleId) {
            return res
                .status(403)
                .json({ message: "No user or schedule information provided" });
        }

        const allowed = await hasPermission(userId, scheduleId, permission);
        if (allowed) {
            return next();
        }

        return res.status(403).json({
            message: "You do not have permission for this action",
        });
    };
}

// returns the string of the required permission to interact with the given role
function getRequiredPerm(role) {
    if (role === "serviceProvider") {
        return "manage:provider";
    } else if (role === "manager") {
        return "manage:manager";
    } else if (role === "carer") {
        return "manage:carer";
    } else if (role === "family" || role === "POA") {
        return "manage:family";
    } else {
        return null;
    }
}

module.exports = { hasPermission, checkPermission, getRequiredPerm };

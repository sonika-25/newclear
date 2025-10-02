// TODO: implement roles into database
const ScheduleUser = require("../model/schedule-user-model.js");

const ROLES = {
    family: [
        "manage:ownUser",
        "create:patient",
        "update:patient",
        "delete:patient",
        "view:patient",
        "manage:organisation",
        "manage:family",
        "delete:schedule",
    ],
    POA: [
        "manage:ownUser",
        "create:patient",
        "update:patient",
        "delete:patient",
        "view:patient",
        "manage:organisation",
        "manage:family",
    ],
    organisation: [
        "manage:ownUser",
        "update:patient",
        "view:patient",
        "manage:carer",
    ],
    carer: ["manage:ownUser", "view:patient", "upload:file"],
};

// check if the given user can perform an action
async function hasPermission(userId, scheduleId, permission) {
    const scheduleUser = await ScheduleUser.findOne({
        user: userId,
        schedule: scheduleId,
    });
    if (!scheduleUser) {
        return false;
    }

    const role = scheduleUser.role;
    if (!role) {
        return false;
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
    if (role === "organisation") {
        return "manage:organisation";
    } else if (role === "carer") {
        return "manage:carer";
    } else if (role === "family" || role === "POA") {
        return "manage:family";
    } else {
        return null;
    }
}

module.exports = { hasPermission, checkPermission, getRequiredPerm };

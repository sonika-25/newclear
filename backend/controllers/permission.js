// TODO: implement roles into database
const ROLES = {
    family: [
        "manage:ownUser",
        "create:patient",
        "update:patient",
        "delete:patient",
        "view:patient",
        "manage:organisation",
    ],
    POA: [
        "manage:ownUser",
        "create:patient",
        "update:patient",
        "delete:patient",
        "view:patient",
        "manage:organisation",
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
function hasPermission(user, permission) {
    return ROLES[user.role].includes(permission);
}

// check if current user has permission
function checkPermission(permission) {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            return res
                .status(403)
                .json({ message: "No user information provided" });
        }

        if (hasPermission(user, permission)) {
            return next();
        }

        return res.status(403).json({
            message: "You do not have permission for this action",
        });
    };
}

module.exports = { hasPermission, checkPermission };

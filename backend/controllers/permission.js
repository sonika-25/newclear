// TODO: implement roles into database
const ROLES = {
    family: [
        "update:ownUser",
        "delete:ownUser",
        "create:patient",
        "update:patient",
        "delete:patient",
        "view:patient",
        "add:organisation",
    ],
    POA: [
        "update:ownUser",
        "delete:ownUser",
        "create:patient",
        "update:patient",
        "delete:patient",
        "view:patient",
        "add:organisation",
    ],
    admin: [
        "update:ownUser",
        "delete:ownUser",
        "update:user",
        "update:patient",
        "view:patient",
        "add:carer",
    ],
    carer: ["update:ownUser", "delete:ownUser", "view:patient", "upload:file"],
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

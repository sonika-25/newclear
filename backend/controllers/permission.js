// TODO: implement roles into database
const ROLES = {
    family: [
        "update:ownUser",
        "create:patient",
        "update:patient",
        "view:patient",
        "add:organisation",
    ],
    POA: [
        "update:ownUser",
        "create:patient",
        "update:patient",
        "view:patient",
        "add:organisation",
    ],
    admin: [
        "update:ownUser",
        "update:user",
        "update:patient",
        "view:patient",
        "delete:patient",
        "add:carer",
        "delete:carer",
    ],
    carer: ["update:ownUser", "view:patient", "upload:files"],
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

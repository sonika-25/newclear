const ROLES = {
    family: [
        "create:ownUser",
        "create:patient",
        "update:patient",
        "view:patient",
        "add:organisation",
    ],
    POA: [
        "create:ownUser",
        "create:patient",
        "update:patient",
        "view:patient",
        "add:organisation",
    ],
    admin: [
        "update:patient",
        "view:patient",
        "delete:patient",
        "add:carer",
        "delete:carer",
    ],
    carer: ["view:patient", "upload:files"],
};

// check if the user can perform an action
function hasPermission(user, permission) {
    return ROLES[user.role].includes(permission);
}

// Middleware for permission handling
// TODO: need the caller's information to be attacked to req.user
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

module.exports = { checkPermission };

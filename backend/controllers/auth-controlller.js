const User = require("../model/user-model");

const home = async (req, res) => {
    try {
        res.send("Welcome to the home page using controllers");
    } catch (error) {
        console.log(error);
    }
};

const register = async (req, res) => {
    try {
        // register handles and response with JSON data
        console.log(req.body);

        const { username, email, phone, password } = req.body;

        // check if any field is empty
        if (!username || !email || !phone || !password) {
            // client error
            return res
                .status(400)
                .json({ message: "Please fill all the fields" });
        }

        // check if the user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        // create a new user
        const user = await User.create({
            username,
            email,
            phone,
            password,
        });

        res.status(201).json({ message: "User registered successfully", user });
        console.log(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Server error. Please try again later.",
        });
    }
};

module.exports = { home, register };

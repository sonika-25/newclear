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
        res.json({ message: "User registered successfully", data: req.body });
    } catch (error) {
        console.log(error);
    }
};

module.exports = { home, register };

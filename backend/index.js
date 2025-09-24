const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Users = require("./model/user-model.js");
const auth = require("./controllers/authentication.js");
const org = require("./controllers/org.js");
const family = require("./controllers/family.js");
const user = require("./controllers/userInfo.js");

const app = express();
const connectDB = require("./utils/db.js");

connectDB();

// Middleware which executes during lifecycle of a request
app.use(express.json());
app.use(cors());

PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
app.use("/users", auth);
app.use("/org",org);
app.use("/family",family);
app.use("/user-info",user)
app.get("/", (req, res) => {
    res.send("Hello World");
});

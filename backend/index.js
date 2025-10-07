const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const auth = require("./controllers/authentication.js");
const org = require("./controllers/org.js");
const family = require("./controllers/family.js");
const patient = require("./controllers/patient.js");
const tasks = require("./controllers/tasksRoute.js");
const user = require("./controllers/user.js");
const userInfo = require("./controllers/userInfo.js");
const schedule = require("./controllers/schedule.js");

const app = express();
const connectDB = require("./utils/db.js");

connectDB();

// Middleware which executes during lifecycle of a request
app.use(express.json());
app.use(
    cors({
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    }),
);

PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
app.use("/org",org);
app.use("/family",family);
app.use("/patients",patient);
app.use("/trial",tasks);
app.use("/users", user);
app.use("/user-info", userInfo);
app.use("/schedule", schedule);


app.get("/", (req, res) => {
    res.send("Hello World");
});

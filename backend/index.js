require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const auth = require("./controllers/authentication.js");
const tasks = require("./routes/tasksRoute.js");
const user = require("./controllers/user.js");
const userInfo = require("./controllers/userInfo.js");
const schedule = require("./routes/scheduleRoute.js");
const connectDB = require("./utils/db.js");

const app = express();
connectDB();

const server = http.createServer(app);
// Socket server to allow for live updates for all users of a schedule upon any updates
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    },
});

io.on("connection", (socket) => {
    socket.on("joinSchedule", (scheduleId) => {
        socket.join(scheduleId);
    });

    socket.on("joinUserRoom", (userId) => {
        socket.join(String(userId));
    });

    socket.on("disconnect", () => {
        // clean up socket
        if (socket.data.scheduleId) {
            socket.leave(socket.data.scheduleId);
        }
        if (socket.data.userId) {
            socket.leave(socket.data.userId);
        }
    });
});

app.set("io", io);

// Middleware which executes during lifecycle of a request
app.use(express.json());
app.use(
    cors({
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    }),
);

app.use("/trial", tasks);
app.use("/users", user);
app.use("/user-info", userInfo);
app.use("/schedule", schedule);

PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

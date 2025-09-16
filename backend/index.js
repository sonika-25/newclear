const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Users = require("./model/user-model.js");
const cont = require("./controllers/users.js");

const app = express();
const connectDB = require("./utils/db.js");

connectDB();

// Middleware which executes during lifecycle of a request
app.use(express.json());
app.use(cors());

PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
app.use("/users", cont);

app.get("/", (req, res) => {
    res.send("Hello World");
});

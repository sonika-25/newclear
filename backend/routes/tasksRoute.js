// routes/taskRoutes.js
const express = require("express");
const r = express.Router();
const ctrl = require("../controllers/tasks");

// create a repeating task under a patient + category
// POST /patients/:patientId/categories/:categoryId/tasks
r.post("/tasks/:categoryId/:scheduleId", ctrl.createTask);

// list upcoming runs for a patient
// GET /patients/:patientId/runs?from=YYYY-MM-DD&to=YYYY-MM-DD
r.get("/tasks/runs/:scheduleId", ctrl.listRuns);
r.get("/categories/tasks/:categoryId", ctrl.listTasksByCategory);

// complete a run (attach note/files if any)
// POST /runs/:runId/complete
r.post("/runs/complete/:runId", ctrl.completeRun);

module.exports = r;

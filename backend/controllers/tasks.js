// controllers/taskCtrl.js
const Task = require("../model/task-model");
const TaskRun = require("../model/task-run-model");
const Category = require("../model/category-model");
const Patient  = require("../model/patient-model"); // if you want to deduct patient budget too
const { addByUnit } = require("../utils/dates");

// create a task that repeats every N months (default 6)
async function createTask(req, res) {
  try {
    const {  categoryId, patientId } = req.params;
    const { name, startDate, endDate, unit, every = 1, description, budget } = req.body;

    const task = await Task.create({
      patientId, categoryId, name, description,
      startDate, endDate: endDate || null,
      unit,every, budget
    });

    // seed first year of runs (2 occurrences for 6-month cycle)
    await seedRuns(task, 20); // monthsAhead = 12
    res.status(201).json(task);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "could not create task" });
  }
}

// make sure runs exist up to N months ahead
async function seedRuns(task, monthsAhead = 12) {
  const start = new Date(task.startDate);
  const horizon = new Date();
  horizon.setMonth(horizon.getMonth() + monthsAhead);

  const endLimit = task.endDate ? new Date(task.endDate) : horizon;

  let due = new Date(start);
  while (due <= endLimit) {
    await TaskRun.updateOne(
      { taskId: task._id, dueOn: due },
      { $setOnInsert: {
          taskId: task._id,
          patientId: task.patientId,
          categoryId: task.categoryId,
          dueOn: due,
          cost: task.costPerRun
        }
      },
      { upsert: true }
    );
    due = addByUnit(due, task.unit, task.every || 1);
  }
}

// list upcoming runs for a patient (simple)
async function listRuns(req, res) {
  try {
    const { patientId } = req.params;
    const from = req.query.from ? new Date(req.query.from) : new Date();
    const to = req.query.to   ? new Date(req.query.to)   : addByUnit(new Date(),"month", 30);

    const runs = await TaskRun.find({
      patientId,
      dueOn: { $gte: from, $lte: to }
    })
    .populate("taskId", "name") 
    .sort({ dueOn: 1 });

    res.json(runs);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "could not list runs" });
  }
}

// mark a run done and deduct budget
async function completeRun(req, res) {
  try {
    const { runId } = req.params;
    const { note, files } = req.body;

    const run = await TaskRun.findById(runId);
    if (!run) return res.status(404).json({ error: "run not found" });
    if (run.done) return res.status(400).json({ error: "already done" });

    run.done = true;
    run.doneAt = new Date();
    if (note) run.note = note;
    if (files) run.files = files;
    await run.save();

    // deduct from category budget
    await Category.updateOne(
      { _id: run.categoryId },
      { $inc: { budget: -run.cost } }
    );

    // OPTIONAL: also deduct from patient total budget if you track it
    await Patient.updateOne(
      { _id: run.patientId },
      { $inc: { budget: -run.cost } }
    );

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "could not complete run" });
  }
}

module.exports = {
  createTask,
  listRuns,
  completeRun,
  seedRuns, // export if you want a daily job to top-up future runs
};

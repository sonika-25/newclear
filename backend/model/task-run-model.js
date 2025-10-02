// models/taskRun.js
const mongoose = require("mongoose");

const TaskRunSchema = new mongoose.Schema({
  taskId:    { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  categoryId:{ type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },

  dueOn:     { type: Date, required: true },        // when this run is due
  cost:      { type: Number, default: 0 },          // cost for this run

  done:      { type: Boolean, default: false },
  doneAt:    { type: Date },
  note:      { type: String },
  files:     [{ url: String, mime: String, size: Number }],
}, { timestamps: true });

// helpful to avoid duplicates
TaskRunSchema.index({ taskId: 1, dueOn: 1 }, { unique: true });

module.exports = mongoose.model("TaskRun", TaskRunSchema);

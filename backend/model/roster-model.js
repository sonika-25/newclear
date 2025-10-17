const mongoose = require("mongoose");
const Schedule = require("./schedule-model");
const User = require("./user-model");

const shiftSchema = new mongoose.Schema({

    morning: {type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null},
    afternoon: {type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null},
    evening: {type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null}
});

const rosterSchema = new mongoose.Schema({
    schedule: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Schedule',
        required: true,
    },
    weekStart: {
        type: Date,
        required: true
    },
    days: {
        monday: {type: shiftSchema, default: () => ({})},
        tuesday: { type: shiftSchema, default: () => ({}) },
        wednesday: { type: shiftSchema, default: () => ({}) },
        thursday: { type: shiftSchema, default: () => ({}) },
        friday: { type: shiftSchema, default: () => ({}) },
        saturday: { type: shiftSchema, default: () => ({}) },
        sunday: { type: shiftSchema, default: () => ({}) }
    }
});

const Roster = mongoose.model("Roster", rosterSchema);
module.exports = Roster;

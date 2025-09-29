const Task = require("../model/task-model");
const Patient = require("../model/patient-model");
const Organization = require("../model/org-model")
const Category = require ("../model/category-model")
const Family = require("../model/family-model")
const express = require("express");
const app = express();
const router = require("express").Router();

router.get("/users/:email/patients", async(req,res) => {

})


router.post("//add-category" , async (req,res) => {
    try {
        const {name, budget} = req.body;
        if (!name) {
            console.log("need a name");
            return;
        }
        await Category.findOne({name: name})
            .then ((res)=>{
                console.log ("category exists")
                return;
            })
        let cat = await new Category.create({
            name: name,
            budget: budget,
        })
        return cat;

    }
    catch (err){console.log(err)}
})

router.post("//finish-task" , async (req,res) => {
    let {taskId, patientId} = req.body;
    let task = await Task.findOne({taskId})
    if (task.isCompleted){
        console.log("already done")
        return;
    }
    await Task.updateOne (
        {"_id" : taskId},
        {  $set: { isCompleted: true }  }
    )
    const amount = Number(task.budget || 0);

    const cat = await Category.findById(task.category).lean();
    const newBudget = Math.max(0, (cat.budget || 0) - amount);
    await Category.updateOne({ _id: cat._id }, { $set: { budget: newBudget } });

    const patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    const newRemaining = Math.max(0, (patient.totalBudgetRemaining || 0) - amount);
    await Patient.updateOne({ _id: patientId }, { $set: { totalBudgetRemaining: newRemaining } });
    
    
})

router.post("//add-task", async (req, res) => {

    try {
        const { patientId , userId} = req.params;
        if (checkAuth (userId,patientId)){
            console.log ("returning function auth not allowed")
            return;
        }
        const {
        task, description, frequency, interval, budget,
        categoryId, categoryName
        } = req.body;

        // 1) Make sure patient exists
        const patient = await Patient.findById(patientId).lean();
        if (!patient) return res.status(404).json({ error: "Patient not found" });

        // 2) Resolve categoryId
        let resolvedCategoryId = categoryId || null;

        if (!resolvedCategoryId && categoryName) {
        // find-or-create category by name (global or you can scope per-org/family later)
        let category = await Category.findOne({ name: categoryName });
        if (!category) {
            category = await Category.create({ name: categoryName, budget: 0 }); // or require budget in request
        }
        resolvedCategoryId = category._id;
        }


        // 3) Create Task (isCompleted default = false recommended)
        const newTask = await Task.create({
        task,
        description,
        frequency,   // ensure Task.frequency is type String with enum DAILY/WEEKLY/MONTHLY/YEARLY
        interval,
        budget,
        category: resolvedCategoryId || undefined,
        isCompleted: false,      // add default in schema too
        assignedToCarer: null
        });

        // 4) Attach to patient.tasks
        await Patient.updateOne(
        { _id: patientId },
        { $addToSet: { tasks: newTask._id } }
        );

  } catch (e) {
    next(e);
  }

});



async function checkAuth(userId,patientId) {
    try {
        let pat = await Patient.findOne ({patientId})
        if (pat.familyId == userId || pat.currentOrgId == userId){
            return true;
        } 
        return false;
    }
    catch (error) {console.log(error)}
}

module.exports = router;

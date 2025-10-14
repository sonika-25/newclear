// scripts/seed.js
// Usage examples:
//   node scripts/seed.js
//   N_ORGS=1 N_FAMILIES=3 N_PATIENTS=6 N_CATS_PER_PAT=4 N_TASKS_PER_PAT=8 RUNS_PER_TASK=20 node scripts/seed.js

require('dotenv').config();
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');

// ---- import your exact models (paths match your repo) ----
const Org      = require('./model/org-model');
const Family   = require('./model/family-model');
const Patient  = require('./model/patient-model');
const Category = require('./model/category-model');
const Task     = require('./model/task-model');
const TaskRun  = require('./model/task-run-model');

// ---- tunables ----
const N_ORGS          = Number(process.env.N_ORGS || 2);
const N_FAMILIES      = Number(process.env.N_FAMILIES || 4);
const N_PATIENTS      = Number(process.env.N_PATIENTS || 8);
const N_CATS_PER_PAT  = Number(process.env.N_CATS_PER_PAT || 5);
const N_TASKS_PER_PAT = Number(process.env.N_TASKS_PER_PAT || 10);
const RUNS_PER_TASK   = Number(process.env.RUNS_PER_TASK || 24); // occurrences to generate per task

// generate next occurrence dates based on unit/every from a start
function* genOccurrences({ startDate, unit, every }, limit) {
  const add = {
    day:  (d, k) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + k),
    week: (d, k) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7 * k),
    month:(d, k) => new Date(d.getFullYear(), d.getMonth() + k, d.getDate()),
    year: (d, k) => new Date(d.getFullYear() + k, d.getMonth(), d.getDate())
  }[unit];

  let i = 0;
  let cur = new Date(startDate);
  while (i < limit) {
    yield cur;
    cur = add(cur, every);
    i++;
  }
}

// pick a compatible (unit, frequency, every)
function randomCadence() {
  const units = ['day', 'week', 'month'];
  const unit  = faker.helpers.arrayElement(units);
  const every = faker.number.int({ min: 1, max: unit === 'day' ? 7 : unit === 'week' ? 4 : 3 });
  // Map unit→Task.frequency for readability only (schema has both)
  const freqMap = { day: 'DAILY', week: 'WEEKLY', month: 'MONTHLY' };
  return { unit, every, frequency: freqMap[unit] };
}

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('❌ Missing MONGO_URI in .env');
    process.exit(1);
  }
  await mongoose.connect(uri);
  console.log('✅ Connected');

  // Optional: clean slate if SAFE_RESET=true
  if (process.env.SAFE_RESET === 'true') {
    await Promise.all([
      Org.deleteMany({}),
      Family.deleteMany({}),
      Patient.deleteMany({}),
      Category.deleteMany({}),
      Task.deleteMany({}),
      TaskRun.deleteMany({}),
    ]);
    console.log('🧹 Collections cleared');
  }

  // ---- 1) Orgs ----
  const orgs = Array.from({ length: N_ORGS }).map(() => ({
    username: faker.internet.username(),
    email: faker.internet.email().toLowerCase(),
    phone: faker.phone.number('04########'), // AU style just for shape
    password: faker.internet.password({ length: 12 }),
    patients: [] // we'll fill later
  }));

  const orgRes = await Org.insertMany(orgs);
  console.log(`🏢 Orgs: ${orgRes.length}`);

  // ---- 2) Families ---- (note: patients is array of strings in your schema)
  const families = Array.from({ length: N_FAMILIES }).map(() => ({
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    role: faker.helpers.arrayElement(['family', 'POA']),
    email: faker.internet.email().toLowerCase(),
    phone: (faker.phone.number('04########')),
    password: faker.internet.password({ length: 12 }),
    patients: []
  }));
  const famRes = await Family.insertMany(families);
  console.log(`👪 Families: ${famRes.length}`);

  // ---- 3) Patients ----
  const patients = Array.from({ length: N_PATIENTS }).map(() => {
    const username = faker.internet.username().toLowerCase();
    const family   = faker.helpers.arrayElement(famRes);
    const org      = faker.helpers.arrayElement(orgRes);
    return {
      username,
      email: faker.internet.email({ firstName: username }).toLowerCase(),
      phone: (faker.phone.number('04########')),
      password: faker.internet.password({ length: 12 }),
      tasks: [],
      currentOrgId: org._id.toString(), // your schema stores this as string
      categories: [],
      familyId: family._id.toString(),  // stored as string in your schema
      budget: faker.number.int({ min: 500, max: 5000 })
    };
  });

  const patRes = await Patient.insertMany(patients);
  console.log(`🧍 Patients: ${patRes.length}`);

  // Backfill Org.patients and Family.patients
  const orgUpdates = {};
  const famUpdates = {};
  for (const p of patRes) {
    orgUpdates[p.currentOrgId] ||= [];
    orgUpdates[p.currentOrgId].push(p._id);

    // family.patients is array of strings – we’ll push patient.username
    famUpdates[p.familyId] ||= [];
    famUpdates[p.familyId].push(p.username);
  }

  await Promise.all(Object.entries(orgUpdates).map(([orgId, pids]) =>
    Org.updateOne({ _id: orgId }, { $addToSet: { patients: { $each: pids } } })
  ));
  await Promise.all(Object.entries(famUpdates).map(([famId, usernames]) =>
    Family.updateOne({ _id: famId }, { $addToSet: { patients: { $each: usernames } } })
  ));
  console.log('🔗 Linked orgs ⇄ patients & families ⇄ patient usernames');

  // ---- 4) Categories per patient ----
  const allCategories = [];
  for (const p of patRes) {
    const cats = Array.from({ length: N_CATS_PER_PAT }).map(() => ({
      name: faker.commerce.department(),
      budget: faker.number.int({ min: 100, max: 1500 }),
      tasks: []
    }));
    const created = await Category.insertMany(cats);
    allCategories.push(...created);
    await Patient.updateOne(
      { _id: p._id },
      { $addToSet: { categories: { $each: created.map(c => c._id) } } }
    );
  }
  console.log(`🏷️ Categories created: ${allCategories.length}`);

  // ---- 5) Tasks per patient ----
  const allTasks = [];
  for (const p of patRes) {
    const catIds = (await Patient.findById(p._id, 'categories').lean()).categories;
    const tasks = Array.from({ length: N_TASKS_PER_PAT }).map(() => {
      const { unit, every, frequency } = randomCadence();
      const startDate = faker.date.past({ years: 1 }); // recent past start
      const catId = faker.helpers.arrayElement(catIds);

      return {
        name: faker.hacker.verb() + ' ' + faker.hacker.noun(),
        description: faker.lorem.sentence(),
        startDate,
        endDate: undefined,
        frequency, // 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'
        unit,      // 'day' | 'week' | 'month' | 'year'
        every,
        budget: faker.number.int({ min: 10, max: 250 }),
        category: catId,
        patientId: p._id,
        isCompleted: false,
        assignedToCarer: faker.person.firstName(),
        active: true
      };
    });

    const created = await Task.insertMany(tasks);
    allTasks.push(...created);

    // Attach tasks to patient and to each Category.tasks
    await Patient.updateOne(
      { _id: p._id },
      { $addToSet: { tasks: { $each: created.map(t => t._id) } } }
    );

    // collect per-category mapping
    const byCat = created.reduce((m, t) => {
      m[t.category.toString()] ||= [];
      m[t.category.toString()].push(t._id);
      return m;
    }, {});

    await Promise.all(Object.entries(byCat).map(([catId, tids]) =>
      Category.updateOne({ _id: catId }, { $addToSet: { tasks: { $each: tids } } })
    ));
  }
  console.log(`✅ Tasks created: ${allTasks.length}`);

  // ---- 6) TaskRuns per task (derived cadence) ----
  const runOps = [];
  for (const t of allTasks) {
    const occ = Array.from(genOccurrences(
      { startDate: t.startDate, unit: t.unit, every: t.every },
      RUNS_PER_TASK
    ));

    for (const dueOn of occ) {
      runOps.push({
        updateOne: {
          filter: { taskId: t._id, dueOn },
          update: {
            $setOnInsert: {
              taskId: t._id,
              patientId: t.patientId,
              categoryId: t.category,
              dueOn,
              cost: t.budget, // you can randomize if you prefer
              done: false
            }
          },
          upsert: true
        }
      });
    }
  }

  // Batch the bulkwrite to avoid huge payloads
  const BATCH = 1000;
  for (let i = 0; i < runOps.length; i += BATCH) {
    const slice = runOps.slice(i, i + BATCH);
    await TaskRun.bulkWrite(slice, { ordered: false });
    process.stdout.write(`📅 TaskRuns upserted: ${Math.min(i + BATCH, runOps.length)} / ${runOps.length}\r`);
  }
  console.log(`\n📊 Total TaskRuns planned: ${runOps.length}`);

  console.log('🎉 Seeding complete');
  await mongoose.disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await mongoose.disconnect();
  process.exit(1);
});

// utils/dates.js
function addMonths(d, n) {
  const x = new Date(d);
  const m = x.getMonth() + n;
  x.setMonth(m);
  // JS Date auto-fixes overflow days (good enough for simple use)
  return x;
}

module.exports = { addMonths };

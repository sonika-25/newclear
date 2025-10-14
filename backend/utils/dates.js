// utils/dates.js
function addByUnit(date, unit, n) {
  const d = new Date(date);
  if (unit === "day")   d.setDate(d.getDate() + n);
  if (unit === "week")  d.setDate(d.getDate() + 7 * n);
  if (unit === "month") d.setMonth(d.getMonth() + n);
  if (unit === "year")  d.setFullYear(d.getFullYear() + n);
  return d;
}

module.exports = { addByUnit };

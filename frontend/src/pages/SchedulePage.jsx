import axios from "axios";
import { useState, useEffect, useMemo } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const PATIENT_ID = "68e392ceaa1d2a361e81c56e";

const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
const formatYMDLocal = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// Parse server date in a timezone-safe way.
// Date format parsing
const parseDateLocal = (value) => {
  if (typeof value === "string") {
    const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) {
      const [_, y, mo, d] = m;
      return new Date(Number(y), Number(mo) - 1, Number(d));
    }
  }
  return new Date(value);
};

const sameDayLocal = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export default function SchedulePage() {
  const [taskList, setTaskList] = useState([]);
  const [showTasks, setShowTasks] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const from = "2025-10-01";
        const to = "2026-10-01";
        const { data } = await axios.get(
          `http://localhost:3000/trial/tasks/runs/${PATIENT_ID}?from=${from}&to=${to}`
        );
        if (!ignore) setTaskList(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  //ormat and precompute dates
  const dueDatesSet = useMemo(() => {
    const set = new Set();
    for (const t of taskList) {
      const due = parseDateLocal(t.dueOn);
      set.add(formatYMDLocal(due));
    }
    return set;
  }, [taskList]);

  const tasksForSelectedDate = useMemo(() => {
    return taskList.filter((t) => sameDayLocal(parseDateLocal(t.dueOn), selectedDate));
  }, [taskList, selectedDate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#FFE3E3",
        color: "#333",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 900, width: "100%" }}>
        <h1>Schedule Page</h1>

        <div
          style={{
            display: "inline-block",
            padding: 16,
            background: "white",
            borderRadius: 12,
            boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
            marginBottom: 12,
          }}
        >
          <Calendar
            value={selectedDate}
            onChange={setSelectedDate}
            tileContent={({ date, view }) =>
              view === "month" && dueDatesSet.has(formatYMDLocal(date)) ? (
                <div
                  style={{
                    marginTop: 2,
                    height: 6,
                    width: 6,
                    borderRadius: "50%",
                    background: "#FF6B6B",
                    marginInline: "auto",
                  }}
                />
              ) : null
            }
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <strong>Selected date:</strong> {formatYMDLocal(selectedDate)}
        </div>

        <button
          onClick={() => setShowTasks((prev) => !prev)}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "none",
            background: "#FF6B6B",
            color: "white",
            cursor: "pointer",
          }}
        >
          {showTasks ? "Hide Tasks" : "Show Tasks"}
        </button>

        {showTasks && (
          <div style={{ marginTop: 20, textAlign: "left", display: "inline-block" }}>
            <h3>Tasks due on {formatYMDLocal(selectedDate)}</h3>
            {tasksForSelectedDate.length > 0 ? (
              <ul style={{ paddingLeft: 18 }}>
                {tasksForSelectedDate.map((task) => (
                  <li key={task._id}>
                    <strong>{task?.taskId?.name || "Unnamed Task"}</strong> —{" "}
                    {parseDateLocal(task.dueOn).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            ) : (
              <div>No tasks due on this date.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

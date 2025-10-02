import axios from "axios";
import { useState, useEffect } from "react";

const PATIENT_ID = "68dcdc74014b5dce70f92e40";

export default function SchedulePage() {
  const [taskList, setTaskList] = useState([]);
  const [showTasks, setShowTasks] = useState(false);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const from = "2025-10-01";
        const to = "2026-10-01";
        const { data } = await axios.get(
          `http://localhost:3000/trial/tasks/runs/${PATIENT_ID}?from=${from}&to=${to}`
        );

        if (!ignore) {
          setTaskList(data);
          console.log("Fetched tasks:", data);
        }
      } catch (err) {
        console.error(err);
      }
    })();

    return () => {
      ignore = true;
    };
  }, []);

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
      <div style={{ textAlign: "center" }}>
        <h1>Schedule Page</h1>

        <button onClick={() => setShowTasks(true)}>Get Tasks</button>

        {showTasks && taskList.length > 0 && (
          <ul style={{ marginTop: "20px", textAlign: "left" }}>
            {taskList.map((task) => (
              <li key={task._id}>
                <strong>{task.taskId.name || "Unnamed Task"}</strong> —{" "}
                {new Date(task.dueOn).toLocaleDateString()}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

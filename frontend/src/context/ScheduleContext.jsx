import React, { createContext, useState, useEffect } from "react";

export const ScheduleContext = createContext();

export function ScheduleProvider({ children }) {
    const [selectedSchedule, setSelectedSchedule] = useState(
        () => localStorage.getItem("selectedSchedule") || null,
    );
    const [scheduleRole, setScheduleRole] = useState(
        () => localStorage.getItem("scheduleRole") || null,
    );

    // Store schedule in localStorage so refresh doesn’t lose it
    useEffect(() => {
        if (selectedSchedule) {
            localStorage.setItem("selectedSchedule", selectedSchedule);
        }
    }, [selectedSchedule]);

    // Store role in localStorage so refresh doesn’t lose it
    useEffect(() => {
        if (scheduleRole) {
            localStorage.setItem("scheduleRole", scheduleRole);
        } else {
            localStorage.removeItem("scheduleRole");
        }
    }, [scheduleRole]);

    return (
        <ScheduleContext.Provider
            value={{
                selectedSchedule,
                setSelectedSchedule,
                scheduleRole,
                setScheduleRole,
            }}
        >
            {children}
        </ScheduleContext.Provider>
    );
}

import React, { createContext, useState, useEffect } from "react";

export const ScheduleContext = createContext();

export function ScheduleProvider({ children }) {
    const [selectedSchedule, setSelectedSchedule] = useState(
        () => sessionStorage.getItem("selectedSchedule") || null,
    );
    const [scheduleRole, setScheduleRole] = useState(
        () => sessionStorage.getItem("scheduleRole") || null,
    );

    // Store schedule in session storage so refresh doesn’t lose it
    useEffect(() => {
        if (selectedSchedule) {
            sessionStorage.setItem("selectedSchedule", selectedSchedule);
        }
    }, [selectedSchedule]);

    // Store role in session storage so refresh doesn’t lose it
    useEffect(() => {
        if (scheduleRole) {
            sessionStorage.setItem("scheduleRole", scheduleRole);
        } else {
            sessionStorage.removeItem("scheduleRole");
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

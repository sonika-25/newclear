import React, { createContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

export const ScheduleContext = createContext();

export function ScheduleProvider({ children }) {
    const [selectedSchedule, setSelectedSchedule] = useState(
        () => sessionStorage.getItem("selectedSchedule") || null,
    );
    const [scheduleRole, setScheduleRole] = useState(
        () => sessionStorage.getItem("scheduleRole") || null,
    );

    // Reset schedule when user is logged out
    const { user } = useAuth();
    useEffect(() => {
        if (!user) {
            setSelectedSchedule(null);
            setScheduleRole(null);
        }
    }, [user]);

    // Store schedule in session storage so refresh doesn’t lose it
    useEffect(() => {
        if (selectedSchedule) {
            sessionStorage.setItem("selectedSchedule", selectedSchedule);
        } else {
            sessionStorage.removeItem("selectedSchedule");
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

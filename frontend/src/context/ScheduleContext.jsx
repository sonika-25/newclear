import React, { createContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

export const ScheduleContext = createContext();

export function ScheduleProvider({ children }) {
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [scheduleRole, setScheduleRole] = useState(null);
    const [initialised, setInitialised] = useState(false);
    const { user, loading } = useAuth();

    // Load the schedule from local storage upon mount
    useEffect(() => {
        const savedSchedule = sessionStorage.getItem("selectedSchedule");
        const savedRole = sessionStorage.getItem("scheduleRole");
        if (savedSchedule) setSelectedSchedule(savedSchedule);
        if (savedRole) setScheduleRole(savedRole);
        setInitialised(true);
    }, []);

    // Reset schedule when user is logged out
    useEffect(() => {
        if (loading) {
            return;
        }

        if (!user) {
            setSelectedSchedule(null);
            setScheduleRole(null);
            sessionStorage.removeItem("selectedSchedule");
            sessionStorage.removeItem("scheduleRole");
        }
    }, [user, loading]);

    // Store schedule in local storage so refresh doesn’t lose it
    useEffect(() => {
        if (selectedSchedule) {
            sessionStorage.setItem("selectedSchedule", selectedSchedule);
        } else {
            sessionStorage.removeItem("selectedSchedule");
        }
    }, [selectedSchedule]);

    // Store role in local storage so refresh doesn’t lose it
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
                initialised,
            }}
        >
            {children}
        </ScheduleContext.Provider>
    );
}

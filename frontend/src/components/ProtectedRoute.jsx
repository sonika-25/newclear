import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { ScheduleContext } from "../context/ScheduleContext.jsx";
import { getAuthHeaders } from "../utils/tokenUtils";
import axios from "axios";
import { App } from "antd";

const ProtectedRoute = ({ children }) => {
    const { user, loading, logout, selectSchedule } = useAuth();
    const { selectedSchedule } = React.useContext(ScheduleContext);
    const { message } = App.useApp();
    const location = useLocation();
    const [checking, setChecking] = useState(true);
    const [valid, setValid] = useState(true);

    useEffect(() => {
        // no need to check if user belongs to schedule in login page
        if (location.pathname === "/login" || loading) {
            return;
        }

        const checkMembership = async () => {
            if (!user) {
                setChecking(false);
                setValid(false);
                return;
            }

            if (!selectedSchedule) {
                // no schedule selected, just allow access
                setChecking(false);
                setValid(true);
                return;
            }

            try {
                const res = await axios.get(
                    `http://localhost:3000/schedule/${selectedSchedule}/users`,
                    { headers: getAuthHeaders() },
                );

                const stillInSchedule = res.data.some(
                    (u) => u.user._id === user._id,
                );

                if (!stillInSchedule) {
                    message.error("You have been removed from this schedule");
                    selectSchedule();
                    return;
                } else {
                    setValid(true);
                }
            } catch (err) {
                if (err.response?.status === 403) {
                    message.error("You no longer have access to this schedule");
                    selectSchedule();
                    return;
                }
                setValid(false);
                console.error("Schedule membership check failed", err);
            } finally {
                setChecking(false);
            }
        };
        checkMembership();

        const interval = setInterval(async () => {
            try {
                const res = await axios.get(
                    `http://localhost:3000/schedule/${selectedSchedule}/users`,
                    { headers: getAuthHeaders() },
                );

                const stillInSchedule = res.data.some(
                    (u) => u.user._id === user._id,
                );
                if (!stillInSchedule) {
                    message.error("You have been removed from this schedule");
                    selectSchedule();
                    clearInterval(interval);
                }
            } catch (err) {
                console.error("Schedule membership check failed", err);
                clearInterval(interval);
            }
        }, 5000); // every 5s

        return () => clearInterval(interval);
    }, [user, selectedSchedule, loading, location.pathname]);

    if (loading || checking) {
        return <div>Loading...</div>;
    }

    // user is not authorised, redirectly to login page
    if (!user || !valid) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return children;
};

export default ProtectedRoute;

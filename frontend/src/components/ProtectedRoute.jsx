import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { ScheduleContext } from "../context/ScheduleContext.jsx";
import { getAuthHeaders } from "../utils/tokenUtils";
import axios from "axios";
import { App } from "antd";
import { useSocket } from "../context/SocketContext.jsx";

const ProtectedRoute = ({ children }) => {
    const socket = useSocket();
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

        // no user or socket available
        if (!user || !socket) {
            setChecking(false);
            setValid(false);
            return;
        }

        // join a personal user room on connection
        socket.emit("joinUserRoom", user._id);

        // handle schedule removal
        const handleRemoval = ({ scheduleId }) => {
            if (scheduleId === selectedSchedule) {
                message.error("You have been removed from this schedule");
                // reset selected schedule
                selectSchedule();
                setValid(false);
            }
        };

        socket.on("removedFromSchedule", handleRemoval);

        setChecking(false);
        // cleanup
        return () => {
            socket.off("removedFromSchedule", handleRemoval);
        };
    }, [socket, user, selectedSchedule, loading, location.pathname]);

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

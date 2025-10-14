import React, { useEffect, useState, useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { ScheduleContext } from "../context/ScheduleContext.jsx";
import { getAuthHeaders } from "../utils/tokenUtils";
import axios from "axios";
import { App } from "antd";
import { useSocket } from "../context/SocketContext.jsx";

const ProtectedRoute = ({ children }) => {
    const socket = useSocket();
    const { user, loading, logout } = useAuth();
    const { selectedSchedule, setSelectedSchedule, initialised } =
        useContext(ScheduleContext);
    const { message } = App.useApp();
    const location = useLocation();
    const [checking, setChecking] = useState(true);
    const [redirectToSelect, setRedirectToSelect] = useState(false);

    // deals with schedule removal
    useEffect(() => {
        // wait for authentication to load
        if (loading) {
            return;
        }

        // no user or socket available
        if (!user || !socket) {
            setChecking(false);
            return;
        }

        // join a personal user room on connection
        socket.emit("joinUserRoom", user._id);

        // handle schedule removal
        const handleRemoval = ({ scheduleId }) => {
            if (scheduleId === selectedSchedule) {
                message.error("You have been removed from this schedule");
                // reset selected schedule
                setSelectedSchedule(null);
                setRedirectToSelect(true);
            }
        };

        socket.on("removedFromSchedule", handleRemoval);

        setChecking(false);

        // cleanup
        return () => socket.off("removedFromSchedule", handleRemoval);
    }, [socket, user, selectedSchedule, loading]);

    // whenever there is no schedule selected, it redirects to schedule selection page
    useEffect(() => {
        // wait for schedule context to load
        if (loading || checking || !initialised) {
            return;
        }

        // no schedule has been selected
        if (!selectedSchedule && location.pathname !== "/select-schedule") {
            if (!redirectToSelect) {
                message.destroy();
                message.info("Please select a schedule first.");
                setRedirectToSelect(true);
            }
        } else if (redirectToSelect) {
            setRedirectToSelect(false);
        }
    }, [selectedSchedule, location.pathname, initialised]);

    if (loading || checking || !initialised) {
        return <div>Loading...</div>;
    }

    // user is not authorised, redirectly to login page
    if (!user) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    if (redirectToSelect) {
        return <Navigate to="/select-schedule" replace />;
    }

    return children;
};

export default ProtectedRoute;

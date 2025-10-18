import React, { useContext, useEffect, useState } from "react";
import {Flex, Button, Space, Typography, App, Card } from "antd";
import "./css/selection.css";
import logo from "../assets/importedlogotest.svg";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ScheduleContext } from "../context/ScheduleContext";
import { getAccessToken } from "../utils/tokenUtils";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

export default function SelectSchedule() {
    const socket = useSocket();
    const { user, loading } = useAuth();
    const {
        selectedSchedule,
        setSelectedSchedule,
        scheduleRole,
        setScheduleRole,
    } = useContext(ScheduleContext);
    const [scheduleUser, setScheduleUser] = useState([]);
    const [pageLoading, setPageLoading] = useState(true);
    const navigate = useNavigate();
    const { message } = App.useApp();

    // Load all the user's schedules
    useEffect(() => {
        if (loading || !user) {
            return;
        }

        axios
            .get("http://localhost:3000/schedule/schedules", {
                headers: { Authorization: `Bearer ${getAccessToken()}` },
            })
            .then((res) => {
                setScheduleUser(res.data);
            })
            .catch((err) => {
                console.error("Failed to load schedules:", err);
                message.error("Failed to load schedules");
            })
            .finally(() => setPageLoading(false));
    }, [loading, user]);

    // Live update of the schedule selection page of the user being added to the schedule
    useEffect(() => {
        if (!socket || !user?._id) {
            return;
        }
        
        const handleAdded = (newScheduleUser) => {
            message.success(
                `You've been added to ${newScheduleUser.schedule.pwsnName}'s schedule`,
            );
            axios
                .get("http://localhost:3000/schedule/schedules", {
                    headers: { Authorization: `Bearer ${getAccessToken()}` },
                })
                .then((res) => setScheduleUser(res.data))
                .catch((err) =>
                    console.error("Failed to refresh schedules:", err),
                );
        };

        socket.on("addedToSchedule", handleAdded);
        return () => socket.off("addedToSchedule", handleAdded);
    }, [socket, user]);

    // Select a schedule
    const handleSelect = (scheduleId, role) => {
        setSelectedSchedule(scheduleId);
        setScheduleRole(role);
        localStorage.setItem("selectedSchedule", scheduleId);
        localStorage.setItem("scheduleRole", role);
        navigate("/home");
        message.success("Schedule selected!");
    };

    // Live update of the schedule selection page when user is removed
    useEffect(() => {
        if (!socket || !user?._id) {
            return;
        }

        const handleRemoved = ({ scheduleId }) => {
            // Remove that schedule from the UI immediately
            setScheduleUser((prev) =>
                prev.filter((s) => s.schedule._id !== scheduleId),
            );

            // Reset schedule for the user being removed
            if (selectedSchedule === scheduleId) {
                setSelectedSchedule(null);
                setScheduleRole(null);
                localStorage.removeItem("selectedSchedule");
                localStorage.removeItem("scheduleRole");
            }
        };

        socket.on("removedFromSchedule", handleRemoved);

        return () => socket.off("removedFromSchedule", handleRemoved);
    }, [socket, user, selectedSchedule]);

    if (pageLoading) {
        return <div>Loading schedules...</div>;
    }

    return (
          <div
            className="background"
                style={{
                    minHeight: "100vh",
                    display: "grid",
                    placeItems: "center",
                    background: "#feeaeaff",
                }}
                >
                    <img src={logo} className="bgLogo" />
        
            <div>
            

                  <Card
                    style={{
                    background: "#ffffffff",
                    width: 600,
                    maxHeight: 900,
                    borderRadius: 20,
                    display: "flex",
                    flexDirection: "column",
                    overflowY:"auto"
                }}
                 styles={{
                    body: { flex: 1, overflowY: "auto" },
                }}
                variant={false}
            >
                <Flex
                    vertical
                    gap="small"
                    align="center"
                    justify="center"
                    style={{ width: "100%" }}
                >
                     <Typography.Title level={3} style={{ textAlign: "center" }}>
                        Select a Schedule
                    </Typography.Title>
            
                {scheduleUser.map((s) => (
                    <Button
                        color="pink"
                        variant="filled"
                        style={{
                            fontSize: "20px",
                            marginTop: 30,
                            marginBottom: 10,
                            width: 400,
                            height: 60,
                        }}
                        key={s.schedule._id}
                        type={
                            selectedSchedule === s.schedule._id
                                ? "primary"
                                : "default"
                        }
                        block
                        onClick={() => handleSelect(s.schedule._id, s.role)}
                    >
                        {`${s.schedule.pwsnName}'s Schedule` ||
                            "Unnamed Schedule"}
                    </Button>
                    
                ))}
                
             </Flex>
        </Card>
        </div>
       
    </div>
    );
}

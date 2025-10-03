import React, { useContext, useEffect, useState } from "react";
import { Button, Space, Typography, message } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ScheduleContext } from "../context/ScheduleContext";
import { getAccessToken } from "../utils/tokenUtils";

export default function SelectSchedule() {
    const {
        selectedSchedule,
        setSelectedSchedule,
        scheduleRole,
        setScheduleRole,
    } = useContext(ScheduleContext);
    const [scheduleUser, setScheduleUser] = useState([]);
    const navigate = useNavigate();

    // Load all the user's schedules
    useEffect(() => {
        axios
            .get("http://localhost:3000/schedule/schedules", {
                headers: { Authorization: `Bearer ${getAccessToken()}` },
            })
            .then((res) => setScheduleUser(res.data))
            .catch(() => message.error("Failed to load schedules"));
    }, []);

    // Select a schedule
    const handleSelect = (scheduleId, role) => {
        setSelectedSchedule(scheduleId);
        setScheduleRole(role);
        navigate("/home");
        message.success("Schedule selected!");
    };

    return (
        <div style={{ padding: 24, maxWidth: 500, margin: "0 auto" }}>
            <Typography.Title level={3} style={{ textAlign: "center" }}>
                Select a Schedule
            </Typography.Title>

            <Space direction="vertical" style={{ width: "100%" }}>
                {scheduleUser.map((s) => (
                    <Button
                        key={s.schedule._id}
                        type={
                            selectedSchedule === s.schedule._id
                                ? "primary"
                                : "default"
                        }
                        block
                        onClick={() => handleSelect(s.schedule._id, s.role)}
                    >
                        {`${s.schedule.residentName}'s Schedule` ||
                            "Unnamed Schedule"}
                    </Button>
                ))}
            </Space>
        </div>
    );
}

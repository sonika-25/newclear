import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
    Flex,
    Typography,
    Input,
    Layout,
    Modal,
    Form,
    Row,
    Card,
    Tabs,
    Col,
    Button,
    Dropdown,
    message,
    Space,
    Divider,
    Tooltip,
} from "antd";
import { DownloadOutlined, UserOutlined } from "@ant-design/icons";
import { Bar, Pie, Column } from "@ant-design/plots";
const { Content } = Layout;

import "./css/selection.css";
import logo from "../assets/importedlogotest.svg";

import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { getAccessToken } from "../utils/tokenUtils";
import { ScheduleContext } from "../context/ScheduleContext";
const baseURL = 'https://newclear-1bcl.vercel.app' ;

export default function SchedulePage() {
    const nav = useNavigate();
    const [isSelectionModalOpen, setSelectionModalOpen] = useState(false);
    const [selectionForm] = Form.useForm();
    const { setSelectedSchedule, setScheduleRole } =
        useContext(ScheduleContext);
    const [newSchedule, setNewSchedule] = useState([
        { name: "1" },
        { name: "2" },
    ]);

    // contains information of logged in user
    const token = getAccessToken();
    let userId = null;
    if (token) {
        const decoded = jwtDecode(token);
        userId = decoded._id;
    }
    if (!userId) {
        return message("No user data found");
    }

    const showNewScheduleModal = () => {
        selectionForm.resetFields();
        setSelectionModalOpen(true);
    };

    const addNewScheduleData = async (values) => {
        const name = values.name;
        try {
            const res = await axios.post(
                `${baseURL}/schedule/create`,
                {
                    scheduleOwner: userId,
                    pwsnName: name,
                },
                { headers: { Authorization: `Bearer ${getAccessToken()}` } },
            );

            const newSchedule = res.data.schedule;
            setSelectedSchedule(newSchedule._id);
            setScheduleRole("family");

            message.success(`Created schedule for ${newSchedule.pwsnName}`);

            setNewSchedule((prev) => [...prev, { name: newSchedule.pwsnName }]);
            nav("/home");
        } catch (err) {
            console.error("Failed to load users", err);
            message.error("Failed to load users");
        }

        setSelectionModalOpen(false);
        selectionForm.resetFields();
    };

    const fetchSchedules = async () => {
        try {
            const res = await axios.get(
                `${baseURL}/schedule/schedules`,
                {
                    headers: { Authorization: `Bearer ${getAccessToken()}` },
                },
            );
            setSchedules(res.data);
            console.log("✅ Loaded schedules:", res.data);
        } catch (err) {
            console.error("❌ Failed to load schedules", err);
            message.error("Failed to load schedules");
        }
    };

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

            <Card
                style={{
                    background: "#ffffffff",
                    width: 600,
                    borderRadius: 20,
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
                    <Button
                        block
                        onClick={showNewScheduleModal}
                        color="pink"
                        variant="filled"
                        type="primary"
                        style={{
                            boxShadow: "0 0px 8px rgba(0, 0, 0, 0.2)",
                            fontSize: "20px",
                            marginTop: 50,
                            marginBottom: 80,
                            width: 500,
                            height: 100,
                        }}
                    >
                        MAKE A NEW SCHEDULE
                    </Button>
                    <Button
                        onClick={() => nav("/select-schedule")}
                        type="primary"
                        block
                        color="pink"
                        variant="filled"
                        style={{
                            boxShadow: "0 0px 8px rgba(0, 0, 0, 0.2)",
                            fontSize: "20px",
                            marginBottom: 50,
                            width: 500,
                            height: 100,
                        }}
                    >
                        ACCESS CURRENT SCHEDULES
                    </Button>
                </Flex>
            </Card>
            <Modal
                title="Add a New Schedule"
                open={isSelectionModalOpen}
                onOk={() => selectionForm.submit()}
                onCancel={() => {
                    setSelectionModalOpen(false);
                }}
            >
                <Form
                    form={selectionForm}
                    layout="vertical"
                    onFinish={addNewScheduleData}
                >
                    <Form.Item
                        label="PWSN Name"
                        name="name"
                        rules={[
                            {
                                required: true,
                                message:
                                    "Please enter a Name for the person you are making a scehdule for",
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

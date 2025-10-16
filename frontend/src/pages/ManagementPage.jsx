import "./css/management.css";
import {
    Modal,
    Tabs,
    Table,
    Popconfirm,
    Radio,
    Layout,
    List,
    Cascader,
    Input,
    DatePicker,
    InputNumber,
    Select,
    Splitter,
    Button,
    Form,
    Switch,
    message,
    Space,
    Typography,
    App,
} from "antd";

import React, { useState, useRef, useMemo, useContext, useEffect } from "react";
import { CloseOutlined, PlusOutlined } from "@ant-design/icons";
import { Pie } from "@ant-design/plots";
import dayjs from "dayjs";
import axios from "axios";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);
import { jwtDecode } from "jwt-decode";
import { io } from "socket.io-client";
import { getAccessToken } from "../utils/tokenUtils";
import { getUserByEmail } from "../utils/userUtils";
import { ScheduleContext } from "../context/ScheduleContext";
import { useSocket } from "../context/SocketContext";

const { Content } = Layout;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

/*Elements of this code utilise basic boiler plate code from AntD.*/

//This defines the budget pie configuration as well as determining if budget is exceeded
const CatPie = ({ data }) => {
    if (data.length == 0) {
        return null;
    }
    let inUse = 0;
    let remaining = 0;
    for (const d of data) {
        if (d.type === "Total In Use") {
            inUse = Number(d.value) || 0;
        } else if (d.type === "Remaining") {
            remaining = Number(d.value) || 0;
        }
    }
    const overBudget = remaining < 0;

    let inputData;

    if (overBudget) {
        inputData = [{ type: "Over Budget By", value: Math.abs(remaining) }];
    } else {
        if (inUse == 0) {
            inputData = [{ type: "Remaining", value: remaining }];
        } else {
            inputData = [
                { type: "Used", value: inUse },
                { type: "Remaining", value: Math.max(remaining, 0) },
            ];
        }
    }

    const config = {
        data: inputData,
        angleField: "value",
        colorField: "type",
        label: {
            text: "value",
            style: {
                fontWeight: "bold",
            },
        },
        scale: {
            color: overBudget
                ? { domain: ["Over Budget By"], range: ["#ff4d4f"] }
                : {
                      domain: ["Used", "Remaining"],
                      range: ["#7d486fff", "#87114c5c"],
                  },
        },
    };
    return (
        <div style={{ width: 400, height: 200, margin: "auto" }}>
            <Pie {...config} />
        </div>
    );
};

export default function ManagementPage() {
    const socket = useSocket();
    const { message } = App.useApp();

    const [userData, setUserData] = useState([]);
    const [userForm] = Form.useForm();

    const { selectedSchedule, scheduleRole, initialised } =
        useContext(ScheduleContext);

    const [isTaskModalOpen, setTaskModalOpen] = useState(false);
    const [taskForm] = Form.useForm();

    const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
    const [categoryForm] = Form.useForm();

    const [editingTaskKey, setEditingTaskKey] = useState(null);
    const isEditingTask = editingTaskKey != null;

    const [editingCatKey, setCatEditingKey] = useState(null);
    const isCatTask = editingCatKey != null;

    /*const [taskData, setTaskData] = useState([
    { key: '0', task: 'New Toothpaste', categoryId: "1", budget: 100, frequency: 30, description: 'Uses protective enamel paste only',
    dateRange: [dayjs('01-01-2025','DD-MM-YYYY'), dayjs('01-01-2025','DD-MM-YYYY')],},
    { key: '1', task: 'New Toothbrush',  categoryId: "1", budget: 100, frequency: 30, description: 'Requires a soft bristle brush due to sensitivity',
    dateRange: [dayjs('01-01-2025','DD-MM-YYYY'), dayjs('01-01-2025','DD-MM-YYYY')]},
    ]);*/
    const [taskData, setTaskData] = useState([]);

    if (!initialised || !selectedSchedule) {
        return <div>Loading schedule...</div>;
    }

    // contains information of logged in user
    const token = getAccessToken();
    if (token) {
        const decoded = jwtDecode(token);
    }
    let roles = [scheduleRole];

    const columns = [
        { title: "Task", dataIndex: "task", key: "task" },
        { title: "Task Budget $", dataIndex: "budget", key: "budget" },
        {
            title: "Schedule Frequency",
            dataIndex: "frequency",
            key: "frequency",
        },
        {
            title: "Remove/Edit Task",
            key: "operation",
            render: (_, record) => (
                <Space size="middle">
                    <Popconfirm
                        title="Edit this task?"
                        okText="Edit"
                        cancelText="Cancel"
                        onConfirm={() => HandleTaskEdit(record)}
                    >
                        <Space size="middle">
                            <a style={{ color: "#224fa3ff" }}>Edit Task</a>
                        </Space>
                    </Popconfirm>
                    <Popconfirm
                        title="Are you sure you want to permanently delete this task?"
                        okText="Delete"
                        cancelText="Cancel"
                        onConfirm={() => HandleTaskDelete(record.key)}
                    >
                        <Space size="middle">
                            <a style={{ color: "#ff0000ff" }}>Delete Task</a>
                        </Space>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const fetchUsers = async () => {
        try {
            const res = await axios.get(
                `http://localhost:3000/schedule/${selectedSchedule}/users`,
                { headers: { Authorization: `Bearer ${getAccessToken()}` } },
            );
            setUserData(res.data);
        } catch (err) {
            console.error("Failed to load users", err);
            message.error("Failed to load users");
        }
    };

    useEffect(() => {
        if (!selectedSchedule) {
            return;
        }
        fetchUsers();
    }, [selectedSchedule]);

    const UserFormComplete = async (values) => {
        try {
            const res = await getUserByEmail(values.email);
            if (!res || !res.data || !res.data._id) {
                console.error("No user found");
                message.error("No user found");
                return;
            }
            if (!values.userType) {
                console.error("Select a User Type");
                message.error("Select a User Type");
                return;
            }
            const userToAdd = res.data;

            // Use an optimistic user to emulate fast addition into UI
            // Rollback to database state if addition fails
            const optimisticUser = {
                user: userToAdd,
                role: values.userType,
                isAdmin: values.admin || false,
                optimistic: true,
            };
            setUserData((prev) => [...prev, optimisticUser]);

            const updated = await axios.post(
                `http://localhost:3000/schedule/${selectedSchedule}/add-user`,
                {
                    userId: userToAdd._id,
                    role: values.userType,
                },
                { headers: { Authorization: `Bearer ${getAccessToken()}` } },
            );
            if (!updated) {
                message.error("Cannot add user");
                return;
            }

            userForm.resetFields();
        } catch (err) {
            const backendMsg =
                err.response?.data?.message || "Failed to add user";
            console.error("Error adding user:", backendMsg);
            message.error(backendMsg, 3);
        } finally {
            // Fetch from database again to ensure it matches with the UI
            await fetchUsers();
        }
    };

    useEffect(() => {
        if (!selectedSchedule) return;

        socket.emit("joinSchedule", selectedSchedule);

        socket.on("userAdded", (newUser) => {
            setUserData((prev) => [...prev, newUser]);
            message.success(`${newUser.user.firstName} added to schedule`);
        });

        return () => socket.off("userAdded");
    }, [selectedSchedule, socket]);

    const RemoveUser = async (idx, userId) => {
        // Optimistic user removal to emulate fast deletion on UI
        // Will rollback if deletion fails
        const prevUsers = [...userData];
        setUserData((prev) => prev.filter((_, i) => i !== idx));

        try {
            await axios.delete(
                `http://localhost:3000/schedule/${selectedSchedule}/remove-user`,
                {
                    data: {
                        removedUser: userId,
                    },
                    headers: { Authorization: `Bearer ${getAccessToken()}` },
                },
            );
            await fetchUsers();
        } catch (err) {
            console.error(
                "Error removing user",
                err.response?.data || err.message,
            );
            message.error(
                err.response?.data?.message || "Failed to remove user",
                3,
            );
            setUserData(prevUsers);
        }
    };

    useEffect(() => {
        if (!selectedSchedule) return;

        socket.emit("joinSchedule", selectedSchedule);

        socket.on("userRemoved", (removedUser) => {
            setUserData((prev) =>
                prev.filter((u) => u.user._id != removedUser.user._id),
            );
            message.success(
                `${removedUser.user.firstName} removed from schedule`,
            );
        });

        return () => socket.off("userRemoved");
    }, [selectedSchedule, socket]);

    const HandleTaskEdit = (key) => {
        setEditingTaskKey(key.key);
        taskForm.setFieldsValue({
            task: key.task,
            budget: key.budget,
            frequency: key.frequency,
            dateRange: key.dateRange,
            description: key.description,
        });
        setTaskModalOpen(true);
    };
    const HandleTaskDelete = (key) => {
        setTaskData((prev) => prev.filter((item) => item.key !== key));
    };

    const ShowTaskModal = () => {
        if (!activeKey) return;
        setTaskModalOpen(true);
    };

    const HandleTaskOk = async (values) => {
        try {
            const [start, end] = values.dateRange ?? [];
            const payload = {
                name: values.task.trim(),
                description: values.description || "",
                startDate: start?.toDate?.() ?? new Date(),
                endDate: end?.toDate?.(),
                every: Number(values.frequency),
                unit: "day", // simple default
                budget: Number(values.budget),
                category: activeKey,
                scheduleId: `${selectedSchedule}`,
            };

            const { data } = await axios.post(
                `http://localhost:3000/trial/tasks/${selectedSchedule}/${activeKey}`,
                payload,
                { headers: { Authorization: `Bearer ${getAccessToken()}` } },
            );

            // add new task to table
            setTaskData((prev) => [
                ...prev,
                {
                    key: data._id,
                    task: data.name,
                    categoryId: activeKey,
                    budget: Number(data.budget) || 0,
                    frequency: data.every
                        ? `${data.every} ${data.unit}${data.every > 1 ? "s" : ""}`
                        : "",
                    description: data.description || "",
                    dateRange: [
                        dayjs(data.startDate),
                        data.endDate
                            ? dayjs(data.endDate)
                            : dayjs(data.startDate),
                    ],
                },
            ]);

            taskForm.resetFields();
            setTaskModalOpen(false);
            message.success("Task added");
        } catch (err) {
            console.error(err);
            message.error(err?.response?.data?.message || "Failed to add task");
        }

        /*old frontend: -*/
        /*if(editingTaskKey){
          setTaskData(prev =>  prev.map(task => {
          if (task.key !== editingTaskKey) 
            {
              return task;
            }
            else{
              return {
                ...task,
                task: values.task.trim(),
                budget: Number(values.budget),
                frequency: Number(values.frequency),
                description: values.description || '',
                dateRange: values.dateRange,
              };
            }
          })
        );
      }
      else{
        setTaskData(prev => [...prev,
        {
          key: crypto.randomUUID(),
          task: values.task.trim(),
          categoryId: activeKey,
          budget: Number(values.budget),
          frequency: Number(values.frequency),
          description: values.description || '',
          dateRange: values.dateRange,
        },
      ]);
      }
        
      taskForm.resetFields();
      setEditingTaskKey(null);
      setTaskModalOpen(false);*/
    };
    /*********************END TAB BOILIER PLATE FROM ANTD WITH SLIGHT EDITS**************************** */

    const [categories, setCategories] = useState([]);
    /*const [categories, setCategories] = useState([
    { id: '1', name: '1', budget: 1000 },
    { id: '2', name: '2', budget: 1000 },
    ]);*
  const [activeKey, setActiveKey] = useState(categories[0]?.id);*/
    const [activeKey, setActiveKey] = useState(null);
    const [catLoading, setCatLoading] = useState(true);
    const [catError, setCatError] = useState(null);
    const tabItems = useMemo(
        () => categories.map((c) => ({ label: c.name, key: c.id })),
        [categories],
    );
    //loads tasks
    useEffect(() => {
        if (!activeKey) return;
        let ignore = false;
        (async () => {
            try {
                const { data } = await axios.get(
                    `http://localhost:3000/trial/categories/tasks/${activeKey}`,
                    {
                        headers: {
                            Authorization: `Bearer ${getAccessToken()}`,
                        },
                    },
                );

                const mapped = (
                    Array.isArray(data) ? data : data.tasks || []
                ).map((t) => ({
                    key: t._id,
                    task: t.name,
                    categoryId: activeKey, // we know which category we fetched
                    budget: Number(t.budget) || 0,
                    frequency: t.every
                        ? `${t.every} ${t.unit}${t.every > 1 ? "s" : ""}`
                        : "",
                    description: t.description || "",
                    dateRange: [
                        dayjs(t.startDate),
                        t.endDate ? dayjs(t.endDate) : dayjs(t.startDate),
                    ],
                    __raw: t,
                }));

                if (!ignore) {
                    // replace rows for this category only
                    setTaskData((prev) => {
                        const others = prev.filter(
                            (x) => x.categoryId !== activeKey,
                        );
                        return [...others, ...mapped];
                    });
                }
            } catch (err) {
                console.error("load tasks failed", err);
                message.error(
                    err?.response?.data?.message || "Failed to load tasks",
                );
            }
        })();

        return () => {
            ignore = true;
        };
    }, [activeKey]);

    async function getActiveKey() {
        console.log(activeKey);
    }
    // === NEW === Load categories for this schedule on mount
    useEffect(() => {
        if (!initialised) {
            return;
        }

        if (
            !selectedSchedule ||
            selectedSchedule === "null" ||
            selectedSchedule === "undefined"
        ) {
            console.warn(
                "Skipping category fetch — invalid selectedSchedule:",
                selectedSchedule,
            );
            return;
        }

        let ignore = false;
        (async () => {
            try {
                setCatLoading(true);
                setCatError(null);
                const { data } = await axios.get(
                    `http://localhost:3000/schedule/${selectedSchedule}/getCategories`,
                    {
                        headers: {
                            Authorization: `Bearer ${getAccessToken()}`,
                        },
                    },
                );
                // normalize: id, name, budget
                const normalized = (
                    Array.isArray(data) ? data : data.categories || []
                ).map((c) => ({
                    id: c.id || c._id,
                    name: c.name,
                    budget: Number(c.budget) || 0,
                }));
                if (!ignore) {
                    setCategories(normalized);
                    // set first tab active if any
                    setActiveKey(normalized[0]?.id || null);
                }
            } catch (err) {
                if (!ignore)
                    setCatError(
                        err?.response?.data?.message ||
                            err.message ||
                            "Failed to load categories",
                    );
            } finally {
                if (!ignore) setCatLoading(false);
            }
        })();
        return () => {
            ignore = true;
        };
    }, [selectedSchedule, initialised]);

    // live updates for manipulating categories
    useEffect(() => {
        if (!selectedSchedule) return;

        socket.emit("joinSchedule", selectedSchedule);

        // detects when a category is added
        socket.on("categoryAdded", (newCat) => {
            setCategories((prev) => {
                // avoid duplicates
                if (
                    prev.some((c) => c.id === newCat.id || c._id === newCat.id)
                ) {
                    return prev;
                }
                return [
                    ...prev,
                    {
                        id: newCat.id || newCat._id,
                        name: newCat.name,
                        budget: Number(newCat.budget) || 0,
                    },
                ];
            });
            message.success(`New category "${newCat.name}" added`);
        });

        // detects when a category is removed
        socket.on("categoryRemoved", (removedCat) => {
            setCategories((prev) => {
                const updated = prev.filter(
                    (c) => c.id !== removedCat.id && c._id !== removedCat.id,
                );
                setTaskData((tasks) =>
                    tasks.filter((t) => t.categoryId !== removedCat.id),
                );
                setActiveKey((prevActive) =>
                    prevActive === removedCat.id
                        ? (updated[0]?.id ?? null)
                        : prevActive,
                );
                return updated;
            });
            message.info("Category removed");
        });

        // detects when a category is edited
        socket.on("categoryEdited", (updatedCat) => {
            setCategories((prev) =>
                prev.map((c) =>
                    c.id === updatedCat.id || c._id === updatedCat.id
                        ? {
                              ...c,
                              name: updatedCat.name,
                              budget: Number(updatedCat.budget) || 0,
                          }
                        : c,
                ),
            );
            message.success(`Category "${updatedCat.name}" updated`);
        });

        return () => {
            socket.off("categoryAdded");
            socket.off("categoryRemoved");
            socket.off("categoryEdited");
        };
    }, [socket, selectedSchedule]);

    const addCategoryData = async (values) => {
        try {
            if (editingCatKey) {
                // Edit the category
                const { data } = await axios.patch(
                    `http://localhost:3000/schedule/${selectedSchedule}/categories/${editingCatKey}`,
                    {
                        name: values.name,
                        budget: values.budget,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${getAccessToken()}`,
                        },
                    },
                );

                // Update UI
                setCategories((prev) =>
                    prev.map((cat) =>
                        cat.id === editingCatKey
                            ? { ...cat, name: data.name, budget: data.budget }
                            : cat,
                    ),
                );
            } else {
                const { data } = await axios.post(
                    `http://localhost:3000/schedule/${selectedSchedule}/add-category`,
                    {
                        name: values.name,
                        budget: values.budget,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${getAccessToken()}`,
                        },
                    },
                );
                // expect either { id, name, budget } or { _id, name, budget } or { category: { ... } }
                const c = data.category || data;
                const id = typeof c === "object" ? c._id : c;
                const budget = Number(c.budget) || 0;
                const name = c.name;

                setCategories((prev) =>
                    prev.map((cat) =>
                        cat.id !== editingCatKey
                            ? cat
                            : { ...cat, budget, name },
                    ),
                );
                setActiveKey(c._id);
            }
        } catch (err) {
            if (err.response?.status === 403) {
                message.error("You don't have permission to add a category.");
            } else if (err.response?.status === 401) {
                message.error("Session expired. Please log in again.");
            } else {
                message.error(
                    err.response?.data?.message || "Failed to add category.",
                );
            }
            console.error("Add category failed:", err);
        } finally {
            setCategoryModalOpen(false);
            categoryForm.resetFields();
            setCatEditingKey(null);
        }
    };

    const HandleCatEdit = (id) => {
        if (!id) {
            return;
        }
        setCatEditingKey(id);
        var catObj = categories.find((c) => c.id == id);
        categoryForm.setFieldsValue({
            name: catObj.name,
            budget: catObj.budget,
        });
        setCategoryModalOpen(true);
    };

    const OnCatChange = (key) => {
        setActiveKey(key ?? null);
    };

    const removeTab = async (categoryId) => {
        try {
            await axios.delete(
                `http://localhost:3000/schedule/${selectedSchedule}/categories/${categoryId}`,
                {
                    headers: { Authorization: `Bearer ${getAccessToken()}` },
                },
            );
            setCategories((prev) => {
                const newList = prev.filter((c) => c.id !== categoryId);
                setTaskData((tasks) =>
                    tasks.filter((t) => t.categoryId !== categoryId),
                );

                setActiveKey((prevActive) =>
                    prevActive === categoryId
                        ? (newList[0]?.id ?? null)
                        : prevActive,
                );

                return newList;
            });
        } catch (err) {
            console.error(err);
            message.error(
                err?.response?.data?.message || "Failed to delete category",
            );
        }
    };

    const onEdit = (targetKey) => {
        if (
            window.confirm(
                "Are you sure? This will permananetly delete all the tasks in this category",
            )
        ) {
            removeTab(targetKey);
        }
    };

    const showCategoryModal = () => {
        setCatEditingKey(null);
        categoryForm.resetFields();
        setCategoryModalOpen(true);
    };
    /*******************END TAB BOILIER PLATE FROM ANTD WITH SLIGHT EDITS***************************************** */
    const displayPie = (key) => {
        if (!key) {
            return [];
        }
        var inUse = 0;
        var catBudget;

        for (const t of taskData) {
            if (t.categoryId == key) {
                inUse += Number(t.budget);
            }
        }
        for (const c of categories) {
            if (key == c.id) {
                catBudget = Number(c.budget);
                break;
            }
        }
        var remainingBudget = catBudget - inUse;
        var overBudget = false;

        if (inUse > catBudget) {
            overBudget = true;
        }
        if (inUse == 0) {
            const data = [{ type: "Remaining", value: remainingBudget }];
            return data;
        }

        const data = [
            { type: "Total In Use", value: inUse },
            { type: "Remaining", value: remainingBudget },
        ];

        return data;
    };

    return (
        <Layout>
            <Content className="manageContent" style={{ padding: "10px 15px" }}>
                <div
                    style={{
                        background: "#FFFFFF",
                        padding: 20,
                        minHeight: "100%",
                        borderRadius: 20,
                    }}
                >
                    <Splitter style={{ height: "890px" }}>
                        <Splitter.Panel defaultSize="25%">
                            <Typography.Title
                                level={4}
                                style={{
                                    marginBottom: "20px",
                                    textAlign: "center",
                                }}
                            >
                                Add People to the Schedule
                            </Typography.Title>
                            <Form
                                form={userForm}
                                onFinish={UserFormComplete}
                                layout="vertical"
                                autoComplete="off"
                            >
                                <Form.Item
                                    style={{ marginRight: 20 }}
                                    name="email"
                                    label="Enter User Email"
                                    rules={[
                                        { required: true },
                                        { type: "email", warningOnly: true },
                                    ]}
                                >
                                    <Input placeholder="Enter user email" />
                                </Form.Item>
                                <Form.Item
                                    name="admin"
                                    label="Enable Admin"
                                    valuePropName="checked"
                                    initialValue={false}
                                >
                                    <Switch />
                                </Form.Item>

                                <Form.Item label="User Type" name="userType">
                                    <Radio.Group>
                                        {/* family member view */}
                                        {(roles.includes("family") ||
                                            roles.includes("POA")) && (
                                            <>
                                                <Radio.Button value="serviceProvider">
                                                    Service Provider
                                                </Radio.Button>
                                                <Radio.Button value="family">
                                                    Family
                                                </Radio.Button>
                                                <Radio.Button value="POA">
                                                    Power of Attorney
                                                </Radio.Button>
                                            </>
                                        )}
                                        {/* service provider view */}
                                        {roles.includes("serviceProvider") && (
                                            <>
                                                <Radio.Button value="manager">
                                                    Manager
                                                </Radio.Button>
                                                <Radio.Button value="carer">
                                                    Carer
                                                </Radio.Button>
                                            </>
                                        )}
                                        {/* manager view */}
                                        {roles.includes("manager") && (
                                            <>
                                                <Radio.Button value="carer">
                                                    Carer
                                                </Radio.Button>
                                            </>
                                        )}
                                        {/* carer view */}
                                        {roles.includes("carer") && (
                                            <>Cannot add users</>
                                        )}
                                    </Radio.Group>
                                </Form.Item>

                                <Form.Item style={{ marginRight: 20 }}>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        block
                                        color="pink"
                                        variant="filled"
                                    >
                                        Add User
                                    </Button>
                                </Form.Item>
                            </Form>
                            <div className="scrollList">
                                <List
                                    style={{ marginRight: 20 }}
                                    header={
                                        <Typography.Title level={5}>
                                            USERS
                                        </Typography.Title>
                                    }
                                    bordered
                                    dataSource={userData}
                                    renderItem={(scheduleUser, idx) => (
                                        <List.Item
                                            actions={[
                                                <Button
                                                    key="remove"
                                                    shape="circle"
                                                    icon={<CloseOutlined />}
                                                    onClick={() =>
                                                        RemoveUser(
                                                            idx,
                                                            scheduleUser.user,
                                                        )
                                                    }
                                                />,
                                            ]}
                                        >
                                            {`${scheduleUser.user.firstName} ${scheduleUser.user.lastName} · ${scheduleUser.role} · Admin Status: ${scheduleUser.isAdmin}`}
                                        </List.Item>
                                    )}
                                />
                            </div>
                        </Splitter.Panel>

                        <Splitter.Panel>
                            <Typography.Title
                                level={4}
                                style={{
                                    marginBottom: "10px",
                                    textAlign: "center",
                                }}
                            >
                                Add a Task or Category to Schedule
                            </Typography.Title>
                            <div>
                                <div style={{ marginBottom: 16 }}>
                                    <Button
                                        icon={<PlusOutlined />}
                                        color="pink"
                                        variant="filled"
                                        style={{ marginLeft: "20px" }}
                                        onClick={showCategoryModal}
                                    >
                                        Add New Category
                                    </Button>
                                    <Button
                                        icon={<PlusOutlined />}
                                        color="pink"
                                        variant="filled"
                                        style={{ marginLeft: "20px" }}
                                        onClick={() => HandleCatEdit(activeKey)}
                                    >
                                        Edit Current Category
                                    </Button>
                                </div>

                                <Tabs
                                    hideAdd
                                    onChange={OnCatChange}
                                    type="editable-card"
                                    onEdit={onEdit}
                                    items={tabItems}
                                    style={{ marginLeft: "20px" }}
                                    //This line was provided by ai to simply my original implementation which had me rewriting tabs twice one with a valid active key and another without.
                                    {...(tabItems.length ? { activeKey } : {})}
                                />
                            </div>

                            <CatPie data={displayPie(activeKey)} />
                            <Button
                                color="pink"
                                variant="filled"
                                disabled={!activeKey}
                                type="primary"
                                onClick={ShowTaskModal}
                                icon={<PlusOutlined />}
                                style={{
                                    marginLeft: "20px",
                                    marginBottom: "10px",
                                }}
                            >
                                Add New Task
                            </Button>

                            <Table
                                style={{ marginLeft: "20px" }}
                                columns={columns}
                                pagination={{ pageSize: 6 }}
                                expandable={{
                                    expandedRowRender: (record) => (
                                        <div>
                                            <p>
                                                Task Notes: {record.description}
                                            </p>
                                            <p>
                                                Schedule Range:{" "}
                                                {String(record.dateRange[0]) +
                                                    " → " +
                                                    String(record.dateRange[1])}
                                            </p>
                                        </div>
                                    ),
                                }}
                                dataSource={taskData.filter(
                                    (r) => r.categoryId === activeKey,
                                )}
                                footer={() => ""}
                            />
                            <Modal
                                title="Add/Edit a Task"
                                open={isTaskModalOpen}
                                onOk={() => taskForm.submit()}
                                onCancel={() => {
                                    setTaskModalOpen(false);
                                    setEditingTaskKey(null);
                                }}
                            >
                                <Form
                                    form={taskForm}
                                    layout="vertical"
                                    onFinish={HandleTaskOk}
                                >
                                    <Form.Item
                                        label="Task"
                                        name="task"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    "Please enter a task name",
                                            },
                                        ]}
                                    >
                                        <Input placeholder="e.g., New Toothbrush" />
                                    </Form.Item>
                                    <Form.Item
                                        label="Task Budget"
                                        name="budget"
                                        rules={[
                                            {
                                                required: true,
                                                message: "Enter a Task Budget",
                                            },
                                        ]}
                                    >
                                        <InputNumber
                                            addonBefore="+"
                                            addonAfter={"$"}
                                            defaultValue={0}
                                            controls
                                        />
                                    </Form.Item>
                                    <Form.Item
                                        label="Start and End Date"
                                        name="dateRange"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    "Enter a Task Start and End Date",
                                            },
                                        ]}
                                    >
                                        <RangePicker format="DD-MM-YYYY" />
                                    </Form.Item>

                                    <Form.Item
                                        label="Task Completion Frequency"
                                        name="frequency"
                                        rules={[
                                            {
                                                required: true,
                                                message: "Enter a Interval",
                                            },
                                        ]}
                                    >
                                        <InputNumber
                                            size="large"
                                            min={1}
                                            max={100000}
                                            defaultValue={30}
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        label="Add task context or further notes"
                                        name="description"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    "Please give some context",
                                            },
                                        ]}
                                    >
                                        <TextArea
                                            showCount
                                            maxLength={100}
                                            placeholder="disable resize"
                                            style={{
                                                height: 120,
                                                resize: "none",
                                            }}
                                        />
                                    </Form.Item>
                                </Form>
                            </Modal>

                            <Modal
                                title="Add/Edit a Category"
                                open={isCategoryModalOpen}
                                onOk={() => categoryForm.submit()}
                                onCancel={() => {
                                    setCategoryModalOpen(false);
                                    setCatEditingKey(null);
                                }}
                            >
                                <Form
                                    form={categoryForm}
                                    layout="vertical"
                                    onFinish={addCategoryData}
                                >
                                    <Form.Item
                                        label="Category"
                                        name="name"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    "Please enter a Category Name",
                                            },
                                        ]}
                                    >
                                        <Input />
                                    </Form.Item>
                                    <Form.Item
                                        label="Category Budget"
                                        name="budget"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    "Please enter a Category Budget",
                                            },
                                        ]}
                                    >
                                        <InputNumber
                                            addonBefore="+"
                                            addonAfter={"$"}
                                            defaultValue={0}
                                            controls
                                        />
                                    </Form.Item>
                                </Form>
                            </Modal>
                        </Splitter.Panel>
                    </Splitter>
                </div>
            </Content>
            <button onClick={getActiveKey}>CLICK</button>
        </Layout>
    );
}

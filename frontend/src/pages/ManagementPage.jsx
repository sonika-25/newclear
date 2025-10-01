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
} from "antd";
import React, { useState, useRef, useMemo } from "react";
import { CloseOutlined, PlusOutlined } from "@ant-design/icons";
import { Pie } from "@ant-design/plots";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);
import { jwtDecode } from "jwt-decode";
import { getAccessToken } from "../utils/tokenUtils";

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
    const [userData, setUserData] = useState([]);
    const [userForm] = Form.useForm();

    const [isTaskModalOpen, setTaskModalOpen] = useState(false);
    const [taskForm] = Form.useForm();

    const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
    const [categoryForm] = Form.useForm();

    const [editingTaskKey, setEditingTaskKey] = useState(null);
    const isEditingTask = editingTaskKey != null;

    const [editingCatKey, setCatEditingKey] = useState(null);
    const isCatTask = editingCatKey != null;

    const [taskData, setTaskData] = useState([
        {
            key: "0",
            task: "New Toothpaste",
            categoryId: "1",
            budget: 100,
            frequency: 30,
            description: "Uses protective enamel paste only",
            dateRange: [
                dayjs("01-01-2025", "DD-MM-YYYY"),
                dayjs("01-01-2025", "DD-MM-YYYY"),
            ],
        },
        {
            key: "1",
            task: "New Toothbrush",
            categoryId: "1",
            budget: 100,
            frequency: 30,
            description: "Requires a soft bristle brush due to sensitivity",
            dateRange: [
                dayjs("01-01-2025", "DD-MM-YYYY"),
                dayjs("01-01-2025", "DD-MM-YYYY"),
            ],
        },
    ]);

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

    const UserFormComplete = (values) => {
        const user = `${values.firstName} ${values.lastName} · ${values.userType} · Admin Status: ${values.admin}`;

        setUserData((prevData) => [...prevData, user]);
        userForm.resetFields();
    };

    const RemoveUser = (idx) => {
        setUserData((prev) => prev.filter((_, i) => i !== idx));
    };

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

    const HandleTaskOk = (values) => {
        if (editingTaskKey) {
            setTaskData((prev) =>
                prev.map((task) => {
                    if (task.key !== editingTaskKey) {
                        return task;
                    } else {
                        return {
                            ...task,
                            task: values.task.trim(),
                            budget: Number(values.budget),
                            frequency: Number(values.frequency),
                            description: values.description || "",
                            dateRange: values.dateRange,
                        };
                    }
                }),
            );
        } else {
            setTaskData((prev) => [
                ...prev,
                {
                    key: crypto.randomUUID(),
                    task: values.task.trim(),
                    categoryId: activeKey,
                    budget: Number(values.budget),
                    frequency: Number(values.frequency),
                    description: values.description || "",
                    dateRange: values.dateRange,
                },
            ]);
        }

        taskForm.resetFields();
        setEditingTaskKey(null);
        setTaskModalOpen(false);
    };
    /*********************END TAB BOILIER PLATE FROM ANTD WITH SLIGHT EDITS**************************** */

    const [categories, setCategories] = useState([
        { id: "1", name: "1", budget: 1000 },
        { id: "2", name: "2", budget: 1000 },
    ]);
    const [activeKey, setActiveKey] = useState(categories[0]?.id);
    const tabItems = useMemo(
        () => categories.map((c) => ({ label: c.name, key: c.id })),
        [categories],
    );

    const addCategoryData = (values) => {
        if (editingCatKey) {
            setCategories((prev) =>
                prev.map((cat) => {
                    if (cat.id != editingCatKey) {
                        return cat;
                    } else {
                        return {
                            ...cat,
                            budget: Number(values.budget),
                            name: `Category: ${values.name}`,
                        };
                    }
                }),
            );
        } else {
            const id = crypto.randomUUID();
            const budget = Number(values.budget) || 0;
            const name = `Category: ${values.name}`;
            setCategories((prev) => [...prev, { id, name, budget }]);
            setActiveKey(id);
        }
        setCategoryModalOpen(false);
        categoryForm.resetFields();
        setCatEditingKey(null);
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

    const removeTab = (categoryId) => {
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
    };

    const onEdit = (targetKey) => {
        if (
            window.confirm(
                "you sure? this will permananetly delete all the tasks in this category",
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

    const token = getAccessToken();
    let roles = [];
    if (token) {
        const decoded = jwtDecode(token);
        console.log(jwtDecode(token));
        roles = decoded.role || [];
    }
    console.log("Roles is ");
    console.log(roles);

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
                                        {roles.includes("family") && (
                                            <>
                                                <Radio.Button value="Manager">
                                                    Manager
                                                </Radio.Button>
                                                <Radio.Button value="Family">
                                                    Family
                                                </Radio.Button>
                                                <Radio.Button value="POA">
                                                    Power of Attorney
                                                </Radio.Button>
                                            </>
                                        )}
                                        {/* carer view */}
                                        {roles.includes("carer") && (
                                            <>Cannot add users</>
                                        )}
                                        {/* organisation view */}
                                        {roles.includes("organisation") && (
                                            <>
                                                <Radio.Button value="Carer">
                                                    Carer
                                                </Radio.Button>
                                            </>
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
                                    rowKey={(_, itemId) => itemId}
                                    renderItem={(item, itemId) => (
                                        <List.Item
                                            actions={[
                                                <Button
                                                    key="remove"
                                                    shape="circle"
                                                    icon={<CloseOutlined />}
                                                    onClick={() =>
                                                        RemoveUser(itemId)
                                                    }
                                                />,
                                            ]}
                                        >
                                            {item}
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
        </Layout>
    );
}

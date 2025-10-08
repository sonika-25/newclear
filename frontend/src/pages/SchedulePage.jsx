import './css/schedule.css';
import React, { useState, useMemo } from "react"
import { Layout, Typography, Calendar, Table, Tag, Button, Modal, Form, Input, DatePicker, Select, Tooltip, Upload } from 'antd';
import { CheckCircleTwoTone, ClockCircleTwoTone, InboxOutlined } from "@ant-design/icons";
import dayjs from 'dayjs';

const { Content } = Layout;
const { Title, Text } = Typography;
const DATE_OPTIONS = { day: "numeric",  month: "long", year: "numeric" };

const MOCK_ITEMS = [
    {
        id: "aaa",
        name: "AAA",
        schedules: [
            { year: 2025, month: 0, status: "completed", completionDate: "2025-01-18", dueDate: "2025-01-20", comments: ""},
            { year: 2025, month: 8, status: "pending", dueDate: "2025-09-10", comments: "" },
        ]
    },
    {
        id: "bbb",
        name: "BBB",
        schedules: [
            { year: 2025, month: 1, status: "pending", dueDate: "2025-02-15", comments: "" },
            { year: 2025, month: 5, status: "pending", dueDate: "2025-06-12", comments: "" },
        ]
    },
    {
        id: "ccc",
        name: "CCC",
        schedules: [
            { year: 2025, month: 8, status: "completed", completionDate: "2025-09-05", dueDate: "2025-09-01", comments: "" },
            { year: 2026, month: 1, status: "pending", dueDate: "2026-02-03", comments: "" },
        ]
    }
];

const formatISO = (iso) => {
    if (!iso) return "-";
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    if (!m) return "-";
    const dt = new Date(+m[1], +m[2] - 1, +m[3]);
    return dt.toLocaleDateString(undefined, DATE_OPTIONS);
};

function getMonthlyTasks(items, year, month) {
    return items.flatMap(it => {
        const s = it.schedules.find(x => x.year === year && x.month === month);
        return s ? [{
            key: `${it.id}-${year}-${month}`,
            id: it.id,
            name: it.name,
            status: s.status,
            completionDate: s.completionDate,
            dueDate: s.dueDate,
            comments: s.comments,
            amountSpent: s.amountSpent,
            documents: s.documents,
            _scheduleRef: s,
        }] : [];
    });
};

export default function SchedulePage() {
    const today = dayjs();
    const [selectedYear, setSelectedYear] = useState(today.year());
    const [selectedMonth, setSelectedMonth] = useState(today.month());
    const [items, setItems] = useState(MOCK_ITEMS);
    const monthData = useMemo(
        () => getMonthlyTasks(items, selectedYear, selectedMonth),
        [items, selectedYear, selectedMonth]
    );

    const cols = [
        {
            title: "Item",
            dataIndex: "name",
            key: "name",
            render: (text, record) => (
                <Button type="link" onClick={() => onOpenModal(record)}>
                    {text}
                </Button>
            )
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            width: 140,
            render: (val) =>
                val === "completed" ? (
                    <Tag icon={<CheckCircleTwoTone twoToneColor="#52c41a" />} color="success">Completed</Tag>
                ) : (
                    <Tag icon={<ClockCircleTwoTone twoToneColor="#faad14" />} color="warning">Upcoming</Tag>   
                )
        },
        {
            title: "Due Date",
            dateIndex: "dueDate",
            key: "dueDate",
            width: 260, 
            render: (_, record) => formatISO(record.dueDate),
        },
        {
            title: "Completion Date",
            dataIndex: "completionDate",
            key: "completionDate",
            width: 260,
            render: (_, record) => formatISO(record.completionDate),
        },
        {
            title: "Comments",
            dataIndex: "comments",
            key: "comments",
            ellipsis: true,
            render: (val) => val
                ? <Tooltip title={val}>
                    <span>
                        {val}
                    </span>
                </Tooltip>
                : <span style={{ opacity: 0.6 }}></span>
        }
    ];

    const [openModal, setOpenModal] = useState(false);
    const [activeRow, setActiveRow] = useState(null);
    const [form] = Form.useForm();

    function onOpenModal(record) {
        setActiveRow(record);
        form.setFieldsValue({
            status: record.status || "upcoming",
            completionDate: record.completionDate ? dayjs(record.completionDate, "YYYY-MM-DD") : null,
            amountSpent: record.amountSpent ?? null,
            documents: (record.documents || []).map((name, i) => ({
                uid: `${record.key}-doc${i}`,
                name,
                status: "done"
            })),
            comments: record.comments || "",
        });

        setOpenModal(true);
    }

    function handleSave(values) {
        setItems(prev =>
            prev.map(it => {
                if (it.id !== activeRow.id) return it;
                
                const nextSchedules = it.schedules.map(sched => {
                    if (sched !== activeRow._scheduleRef) return sched;

                    const next = { ...sched, status: values.status };
                    
                    if (values.status === "completed" && values.completionDate) {
                        next.completionDate = values.completionDate.format("YYYY-MM-DD");
                    }

                    else {
                        next.completionDate = undefined;
                    }

                    next.amountSpent = values.amountSpent ?? undefined;
                    next.documents = (values.documents || []).map(f => f.name);
                    next.comments = values.comments || "";
                    return next;
                });

                return { ...it, schedules: nextSchedules };
            })
        );
        setOpenModal(false);
        form.resetFields();
    }

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Content className="schedule" style={{ padding: "10px 15px" }}>
                <div
                    style={{
                        background: "#fff",
                        padding: 20,
                        minHeight: "calc(100vh - 20px)",
                        borderRadius: 20,
                    }}
                >
                    <Title level={4} style={ {marginTop: 0 }}>Schedule</Title>
                
                    <div style={{ display: "grid", gridTemplateColumns: "420px 1fr", gap: 16 }}>
                        
                        {/* Calendar component (left side) */}
                        <Calendar
                            fullscreen={false}
                            mode="year"
                            value={dayjs().year(selectedYear).month(selectedMonth).date(1)}
                            onSelect={(d) => {
                                setSelectedYear(d.year());
                                setSelectedMonth(d.month());
                            }}
                            onPanelChange={(d) => setSelectedYear(d.year())}
                            style={{ border: "1px solid #f0f0f0", borderRadius: 12, background: "#fff" }}
                        />

                        {/* Table component (right side) */}
                        <div style={{ border: "1px solid #f0f0f0", borderRadius: 12, padding: 12 }}>
                            <div style={{ marginBottom: 8}}>
                                <Text strong>{dayjs().month(selectedMonth).format("MMMM")} {selectedYear}</Text>
                                <Text type="secondary" style={{ marginLeft: 8}}>
                                    • {monthData.length} task{monthData.length !== 1 ? "s" : ""}
                                </Text>
                            </div>

                            <Table
                                size="middle"
                                columns={cols}
                                dataSource={monthData}
                                rowKey="key"
                                pagination={false}
                            />
                        </div>
                    </div>
                </div>
            </Content>
            {/* modal form for task updates */}
            <Modal
                title={activeRow ? `Update: ${activeRow.name}` : "Update"}
                open={openModal}
                onCancel={() => { form.resetFields(); setOpenModal(false); }}
                okText="Save"
                onOk={() => form.submit()}
                destroyOnHidden
            >
                <Form form={form} layout="vertical" onFinish={handleSave} initialValues={{ status: "upcoming" }}>
                    {/* item status */}
                    <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                        <Select
                            options={[
                                { value: "upcoming", label: "Upcoming" },
                                { value: "completed", label: "Completed"},
                            ]}
                        />
                    </Form.Item>

                    {/* date completed */}
                    <Form.Item
                        name="completionDate"
                        label="Completion Date"
                        dependencies={["status"]}
                        rules={[
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (getFieldValue("status") !== "completed") return Promise.resolve();
                                    if (value) return Promise.resolve();
                                    return Promise.reject(new Error("Please pick a completion date"));
                                },
                            }),
                        ]}
                    >
                        <DatePicker style={{ width: "100%" }}/>
                    </Form.Item>

                    {/* upload documents */}

                    <Form.Item
                        name="documents"
                        label="Upload receipt/invoice/proof of purchase"
                        valuePropName="fileList"
                        getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
                    >
                        <Upload.Dragger
                            beforeUpload={() => false}
                            multiple
                            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                            listType="text"
                            maxCount={5}
                        >
                            <p className="ant-upload-drag-icon">
                                <InboxOutlined />
                            </p>
                            <p className="ant-upload-text">
                                Click or drag files to this area to upload
                            </p>
                            <p className="ant-upload-hint">
                                Supports up to 5 files.
                            </p>
                        </Upload.Dragger>
                    </Form.Item>

                    {/* comments */}
                    <Form.Item name="comments" label="Comments">
                        <Input.TextArea rows={3} placeholder="Optional Comments"/>
                    </Form.Item>
                </Form>
            </Modal>
        </Layout>
    )
}
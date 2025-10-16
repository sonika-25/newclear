import './css/schedule.css';
import React, { useState, useMemo } from "react"
import { Layout, Typography, Calendar, Table, Tag, Button, Modal, Form, Input, DatePicker, Select, Tooltip, Upload } from 'antd';
import { CheckCircleTwoTone, ClockCircleTwoTone, ExclamationCircleTwoTone, InboxOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import dayjs from 'dayjs';

const { Content } = Layout;
const { Title, Text } = Typography;
const DATE_OPTIONS = { day: "numeric",  month: "long", year: "numeric" };
const TODAY = () => new Date();

function isISO(s) {
    return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function toLocalDate(iso) {
    if (!isISO(iso)) return null;
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d);
}

function deriveStatus(entry) {
    if (entry.status === "completed") return "completed";
    const due = toLocalDate(entry.dueDate);
    if (!due) return "upcoming";
    const now = TODAY();
    due.setHours(0,0,0,0);
    now.setHours(0,0,0,0);
    return due < now ? "overdue" : "upcoming";
}

function statusTagProps(status) {
    switch (status) {
        case "completed": 
            return { 
                color: "success",
                label: "Completed",
                icon: <CheckCircleTwoTone twoToneColor="#52c41a" />
            };
        case "overdue": 
            return { 
                color: "error", 
                label: "Overdue",
                icon: <ExclamationCircleTwoTone twoToneColor="#ff4d4f" />
            };
        default: 
            return { 
                color: "processing", 
                label: "Upcoming",
                icon: <ClockCircleTwoTone twoToneColor="#1677ff" />
            };
    }
}

function statusColor(status) {
    if (status === "completed") return "#52c41a";
    if (status === "overdue") return "#ff4d4f";
    return "#1677ff";
}

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
            { year: 2025, month: 9, status: "pending", dueDate: "2025-10-20", comments: "" },
            { year: 2026, month: 1, status: "pending", dueDate: "2026-02-03", comments: "" },
        ]
    }
];

const CARERS = [
    { id: "c1", name: "Alice"},
    { id: "c2", name: "Ben"},
    { id: "c3", name: "Chloe"},
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const SHIFT_OPTIONS = [
    { value: "morning", label: "Morning" },
    { value: "afternoon", label: "Afternoon" },
    { value: "evening", label: "Evening" },
]

function shiftTag(shift) {
    if (!shift) return <span style={{opacity:.5}}></span>
    const map = {
        morning: { color: "gold", text: "Morning" },
        afternoon: { color: "blue", text: "Afternoon" },
        evening: { color: "purple", text: "Evening" },
    }
    const m = map[shift];
    return <Tag color={m.color}>{m.text}</Tag>
}

function formatISO(iso) {
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

    const [selectedDayIdx, setSelectedDayIdx] = useState(0);

    const [roster, setRoster] = useState({
        c1: { 0: "morning", 2: "evening" },
        c2: { 4: "afternoon" },
        c3: { 6: "evening" },
    });

    const [addOpen, setAddOpen] = useState(false);
    const [fullOpen, setFullOpen] = useState(false);
    const [addForm] = Form.useForm();

    function getShift(carerID, dayIdx) {
        return roster[carerID]?.[dayIdx] || null;
    }

    function setShift(carerID, dayIdx, shift) {
        setRoster(prev => ({
            ...prev,
            [carerID]: { ...(prev[carerID] || {}), [dayIdx]: shift }
        }));
    }

    function onAddShift(values) {
        setShift(values.carerID, values.dayIdx, values.shift);
        setAddOpen(false);
        addForm.resetFields();
    }

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
            key: "derivedStatus",
            width: 140,
            render: (_, record) => {
                const st = deriveStatus(record);
                const { color, label, icon } = statusTagProps(st);
                return <Tag 
                        color={color}
                        icon={icon}
                        style={{ display: "inline-flex", alignItems: "center" }}
                    >
                        {label}
                    </Tag>;
            }
        },
        {
            title: "Due Date",
            key: "dueDate",
            width: 260, 
            render: (_, r) => formatISO(r.dueDate),
        },
        {
            title: "Completion Date",
            key: "completionDate",
            width: 260,
            render: (_, r) => formatISO(r.completionDate),
        },
        {
            title: "Comments",
            dataIndex: "comments",
            key: "comments",
            ellipsis: true,
            render: (val) =>
                val ? <Tooltip title={val}>{val}</Tooltip> : <span style={{ opacity: 0.6 }}></span>
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

    function cellRender(current, info) {
        if (info.type !== "month") return info.originNode;

        const y = current.year();
        const m = current.month();
        const tasks = getMonthlyTasks(items, y, m);
        
        const dots = tasks.map((t) => statusColor(deriveStatus(t)));
        const MAX_DOTS = 8;
        const shown = dots.slice(0, MAX_DOTS);
        const extra = dots.length - shown.length;

        return (
            <div style={{ textAlign: "center", padding: "6px 0"}}>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 4,
                        height: 12,
                    }}
                >
                    {shown.length === 0 ? (
                        <span
                            style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background: "#fff",
                                border: "none",
                                display: "inline-block"
                            }}
                        />
                    ) : (
                        <>
                            {shown.map((c, i) => (
                                <span
                                    key={i}
                                    style={{
                                        width: 8, 
                                        height: 8,
                                        borderRadius: "50%",
                                        background: c,
                                        display: "inline-block"
                                    }}
                                />
                            ))}
                            {extra > 0 && (
                                <span style={{ fontSize: 12, opacity: 0.7 }}>+{extra}</span>
                            )}
                        </>
                    )}
                </div>
            </div>
        );
    }

    function calendarHeaderRender({ value, onChange }) {
        const currentYear = value.year();

        const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i).map((y) => ({
            value: y,
            label: y.toString(),
        }));

        const handleChange = (year) => onChange(value.clone().year(year));
        const go = (delta) => onChange(value.clone().year(currentYear + delta));

        return (
            <div 
                style={{ 
                    position: "relative",
                    display: "flex", 
                    gap: 8, 
                    alignItems: "center", 
                    justifyContent: "flex-start", 
                    padding: 8 
                }}
            >
                <Button size="small" icon={<LeftOutlined />} onClick={() => go(-1)} />

                <Select
                    size="small"
                    value={currentYear}
                    onChange={handleChange}
                    options={years}
                    style={{ width: 100, textAlign: "center" }}
                    popupMatchSelectWidth={false}
                />
                
                <Button size="small" icon={<RightOutlined />} onClick={() => go(1)}/>
            </div>
        )

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
                
                    <div className="schedule-two-col">
                        <div className="schedule-left-stack">
                            {/* Calendar component (top left) */}
                            <div className="card">
                                <Calendar
                                    className="sched-cal"
                                    fullscreen={false}
                                    mode="year"
                                    headerRender={calendarHeaderRender}
                                    value={dayjs().year(selectedYear).month(selectedMonth).date(1)}
                                    cellRender={cellRender}
                                    onSelect={(d) => {
                                        setSelectedYear(d.year());
                                        setSelectedMonth(d.month());
                                    }}
                                    onPanelChange={(d) => setSelectedYear(d.year())}
                                    style={{
                                        border: "none",
                                        background: "transparent",
                                    }}
                                />
                            </div>

                            {/* Table component (bottom left) */}
                            <div className="card card-scroll">
                                <div style={{ marginBottom: 8 }}>
                                    <Text strong>
                                        {dayjs().month(selectedMonth).format("MMMM")} {selectedYear}
                                    </Text>
                                    
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

                        <div className="card roster-panel">
                            {/* Roster component (right) */}
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    marginBottom: 8
                                }}
                            >
                                <Text strong>Roster</Text>

                                <div
                                    style={{
                                        display: "flex",
                                        gap: 8
                                    }}
                                >
                                    <Button onClick={() => setAddOpen(true)} type="primary">
                                        Add Shift
                                    </Button>

                                    <Button onClick={() => setFullOpen(true)}>
                                        Full Week Roster
                                    </Button>
                                </div>
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    marginBottom: 8
                                }}
                            >
                                <Button 
                                    icon={<LeftOutlined/>} 
                                    onClick={ () => setSelectedDayIdx((i) => (i + 6) % 7)}
                                />
                                
                                <Text type="secondary">
                                    {DAYS[selectedDayIdx]}
                                </Text>
                                
                                <Button 
                                    icon={<RightOutlined/>} 
                                    onClick={ () => setSelectedDayIdx((i) => (i + 1) % 7)}
                                />
                            </div>

                            <Table
                                size="small"
                                pagination={false}
                                rowKey="id"
                                dataSource={CARERS.map(c => ({
                                    id: c.id,
                                    name: c.name,
                                    shift: getShift(c.id, selectedDayIdx),    
                                }))}
                                columns={[
                                    { title: "Carer", dataIndex: "name", width: 140 },
                                    { title: "Shift", dataIndex: "shift", render: (val) => shiftTag(val) },
                                ]}
                                style={{
                                    flex: 1
                                }}
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
                                { value: "pending", label: "Upcoming" },
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

            {/* modal form for adding shifts */}
            <Modal
                title="Add Shift"
                open={addOpen}
                onCancel={() => { addForm.resetFields(); setAddOpen(false); }}
                okText="Add"
                onOk={() => addForm.submit()}
                destroyOnHidden
            >
                <Form
                    form={addForm}
                    layout="vertical"
                    onFinish={onAddShift}
                    initialValues={{ dayIdx: selectedDayIdx }}
                >
                    <Form.Item
                        name="carerID"
                        label="Carer"
                        rules={[{ required: true }]}
                    >
                        <Select options={CARERS.map(c => ({ value: c.id, label: c.name }))}/>
                    </Form.Item>

                    <Form.Item
                        name="dayIdx"
                        label="Day"
                        rules={[{ required: true }]}
                    >
                        <Select options={DAYS.map((d, i) => ({ values: i, label: d }))}/>
                    </Form.Item>
                    
                    <Form.Item
                        name="shift"
                        label="Shift"
                        rules={[{ required: true, message: "Pick one shift" }]}
                    >
                        <Select
                            options={SHIFT_OPTIONS}
                        />
                    </Form.Item>
                </Form>
            </Modal>

            {/* modal pop out for full roster view */}
            <Modal
                title="Full Week Roster"
                open={fullOpen}
                onCancel={() => setFullOpen (false)}
                footer={null}
                width={800}
                destroyOnHidden
            >
                <Table
                    size="small"
                    pagination={false}
                    rowKey="id"
                    dataSource={CARERS.map(c => ({ id: c.id, name: c.name }))}
                    columns={[
                        { title: "Carer", dataIndex: "name", fixed: "left", width: 140 },
                        ...DAYS.map((d, i) => ({
                            title: d,
                            dataIndex: `d${i}`,
                            render: (_,r) => shiftTag(getShift(r.id, i)),
                        }))
                    ]}
                    scroll={{ x: true }}
                />
            </Modal>
        </Layout>
    )
}

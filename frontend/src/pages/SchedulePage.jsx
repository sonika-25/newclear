import './css/schedule.css';
import React, { useState, useMemo } from "react"
import { Layout, Typography, Calendar, Table, Tag, Button, Modal, Form, Input, DatePicker, Select, Space } from 'antd';
import { CheckCircleTwoTone, ClockCircleTwoTone } from "@ant-design/icons";
import dayjs from "dayjs";

const { Content } = Layout;
const { Title, Text } = Typography;

const MOCK_ITEMS = [
    { id: "aaa", name: "AAA", schedules: [{ year: 2025, month: 0, status: "completed", completedOn: "2025-01-18" }, { year: 2025, month: 8, status: "upcoming" }] },
    { id: "bbb", name: "BBB", schedules: [{ year: 2025, month: 1, status: "upcoming" }, { year: 2025, month: 5, status: "upcoming" }] },
    { id: "ccc", name: "CCC", schedules: [{ year: 2025, month: 8, status: "completed", completedOn: "2025-09-05" }] },
];

function getMonthlyTasks(items, year, month) {
    return items.flatMap(it => {
        const s = it.schedules.find(x => x.year === year && x.month === month);
         return s ? [{
            key: `${it.id}-${year}-${month}`,
            id: it.id,
            name: it.name,
            status: s.status,
            completedOn: s.completedOn,
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
            title: "Completed On",
            dataIndex: "completedOn",
            key: "completedOn",
            width: 160,
            render: (val) => (val ? dayjs(val).format("DD MMM YYYY") : "-"),
        },
    ];

    const [openModal, setOpenModal] = useState(false);
    const [activeRow, setActiveRow] = useState(null);
    const [form] = Form.useForm();

    function onOpenModal(record) {
        setActiveRow(record);
        form.setFieldsValue({
            status: record.status || "upcoming",
            completedOn: record.completedOn ? dayjs(record.completedOn) : null,
            notes: "",
        });
        setOpenModal(true);
    }

    function handleSave(values) {
        setItems(prev =>
            prev.map(it => {
                if (it.id !== activeRow.id) return it;
                const nextSchedules = it.schedules.map(s => {
                    if (s === activeRow._scheduleRef) {
                        const next = { ...s, status: values.status };
                        next.completedOn =
                            values.status === "completed" && values.completedOn
                                ? values.completedOn.toISOString()
                                : undefined;
                        return next;
                    }
                    return s;
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
                        name="completedOn"
                        label="Completed On"
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

                    {/* comments */}
                    <Form.Item name="comments" label="Comments">
                        <Input.TextArea rows={3} placeholder="Optional Comments"/>
                    </Form.Item>
                </Form>
            </Modal>
        </Layout>
    )
}
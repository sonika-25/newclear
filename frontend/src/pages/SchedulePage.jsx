import './css/schedule.css';
import { useState } from "react"
import { Modal, Layout, Button, Typography, Table, InputNumber } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
const { Content } = Layout;
const { Title } = Typography;

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function SchedulePage() {
    const [year, setYear] = useState(new Date().getFullYear());

    // collumns for schedule
    const cols = [
        {
            title: "TASK",
            dataIndex: "item",
            key: "item",
            width: "13%",
            render: (val) => (
                <div className="taskCell">{val}</div>
            ),
        },
        // month columns
        ...MONTHS.map((m, idx) => ({
            title: m,
            dataIndex: `m${idx+1}`,
            key: `m${idx+1}`,
            width: "7.25%",
            align: "center",
            render: (cell) => cell ?? null,
        })),
    ];

    // test data
    const data = [
        { key: "A", item: "AAA" },
        { key: "B", item: "BBB" },
        { key: "C", item: "CCC" },
    ];

    return (
        <Layout>
            <Content className='schedule' style={{ padding: '10px 15px' }}>
                <div
                    style={{
                        background: "#FFFFFF",
                        padding: 20,
                        minHeight: "calc(100vh - 20px",
                        borderRadius: 20,
                        display: "flex",
                        flexDirection: "column"
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 12,
                        }}
                    >
                        <Title level={4} style={{ margin: 0 }}>
                            Schedule
                        </Title>

                        {/* year selector */}
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <Button 
                                icon={<LeftOutlined />}
                                onClick={() => setYear((y) => y - 1)}
                            />
                            <InputNumber
                                value={year}
                                onChange={(val) => val && setYear(val)}
                                controls={false}
                                style={{ width: 100, textAlign: "center" }}
                            />
                            <Button 
                                icon={<RightOutlined/>}
                                onClick={() => setYear((y) => y + 1)}
                            />
                        </div>
                    </div>

                    {/* schedule component */}
                    <Table
                        bordered
                        columns={cols}
                        dataSource={data}
                        pagination={false}
                        tableLayout="fixed"
                    />
                </div>
            </Content>
        </Layout>
    )
}
import React from "react";
import { ConfigProvider, theme, Card, Typography } from "antd";
const { Title, Text } = Typography;

export default function LoginPage() {
    return (
        <ConfigProvider theme={{ algorithm: theme.defaultAlgorithm}}>
            <div
                style={{
                    minHeight: "100vh",
                    wdith: "100%",
                    display: "grid",
                    placeItems: "center",
                    background: "#fff"
                }}
            >
                <Card style={{ width: 360 }} bordered={false}>
                    <Title level={3} style={{ marginBottom: 4 }}>Sign In</Title>
                    <Text type="secondary">Welcome</Text>
                </Card>
            </div>
        </ConfigProvider>
    );
}
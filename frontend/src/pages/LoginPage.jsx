import React from "react";
import LogoReact from "/src/pages/LoginPage.jsx";
import { ConfigProvider, theme, Card, Typography } from "antd";
const { Title, Text } = Typography;

// Add React Logo on the home page (temporary)
function ReactLogo({ size = 420}) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 841.9 595.3"
            fill="none"
            xmlns={LogoReact}
            style={{ opacity: 0.1 }}
        >
            <g stroke="currentColor" strokeWidth="40">
                <ellipse cx="420.9" cy="296.5" rx="190" ry="380"/>
                <ellipse cx="420.9" cy="296.5" rx="190" ry="380" transform="rotate(60 420.9 296.5)"/>
                <ellipse cx="420.9" cy="296.5" rx="190" ry="380" transform="rotate(120 420.9 296.5)"/>
            </g>
            <circle cx="420.9" cy="296.5" r="50" fill="currentColor"/>
        </svg>
    )
}

// Login card
export default function LoginPage() {
    return (
        <ConfigProvider theme={{ algorithm: theme.defaultAlgorithm}}>
            <div
                style={{
                    minHeight: "100vh",
                    position: "relative",
                    width: "100%",
                    display: "grid",
                    placeItems: "center",
                    background: "#fff",
                    color: "#1677ff",
                }}
            >
                <div
                    aria-hidden
                    style={{
                        position: "absolute",
                        inset: 0,
                        display: "grid",
                        placeItems: "center",
                        pointerEvents: "none",
                    }}
                >
                    <ReactLogo />
                </div>
                <Card style={{ width: 360 }} bordered={false}>
                    <Title level={3} style={{ marginBottom: 4 }}>Sign In</Title>
                    <Text type="secondary">Welcome</Text>
                </Card>
            </div>
        </ConfigProvider>
    );
}
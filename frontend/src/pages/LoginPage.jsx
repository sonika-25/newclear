import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LogoReact from "/src/assets/react.svg";
import { ConfigProvider, theme, Card, Typography, Form, Input, Button, Checkbox } from "antd";
import { App as AntApp } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
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

// temporary authentication
function tempAuth({ email, password }) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const ok = email?.includes("@") && (password?.length ?? 0) >= 6;
            ok
                ? resolve({ user: { email }, token: "dev-only-token" })
                : reject(new Error("Invalid credentials"))
        }, 800);
    });
}

// Login card
export default function LoginPage() {
    const [submitting, setSubmitting] = useState(false);
    const { message } = AntApp.useApp();
    const navigate = useNavigate();

    // temp authenticaion
    async function onFinish(values) {
        setSubmitting(true);
        try {
            const result = await tempAuth(values);
            message.success(`Welcome ${result.user.email}`);
            navigate("/home");
        }

        catch (err) {
            message.error(err.message);
        }

        finally {
            setSubmitting(false);
        }
    }

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

                {/* login form using ant design ui */}
                <Card style={{ width: 360 }} bordered={false}>
                    <div style={{ textAlign: "center", marginBottom: 8 }}>
                        <Title level={3} style={{ marginBottom: 4 }}>Sign In</Title>
                        <Text type="secondary">Keep Clear: Schelduing for Care</Text>
                    </div>

                    <Form
                        name="login"
                        layout="vertical"
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                        disabled={submitting}
                    >
                        {/* email input */}
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[
                                { required: true, message: "Please enter your email" },
                                { type: "email", message: "That doesn't look like a valud email" }
                            ]}
                        >
                            <Input prefix={<UserOutlined />}/>
                        </Form.Item>
                        
                        {/* password input */}
                        <Form.Item
                            label="Password"
                            name="password"
                            rules={[
                                { required: true, message: "Please enter your password" },
                                { min: 6, message: "Password must be at least 6 characters" },
                            ]}
                        >
                            <Input.Password prefix={<LockOutlined />}/>
                        </Form.Item>
                        
                        {/* remember details & forgot password button */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                            <Form.Item name="remember" valuePropName="checked" noStyle>
                                <Checkbox>Remember me</Checkbox>
                            </Form.Item>
                            <a href="#">Forgot Password</a>
                        </div>

                        {/* sign in button */}
                        <Button type="primary" htmlType="submit" block loading={submitting}>
                            Sign in
                        </Button>
                    </Form>
                </Card>
            </div>
        </ConfigProvider>
    );
}
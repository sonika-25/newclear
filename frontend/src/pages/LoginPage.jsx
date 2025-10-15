import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    ConfigProvider,
    theme,
    Card,
    Typography,
    Form,
    Input,
    Button,
    Checkbox,
    Modal,
} from "antd";
import { App as AntApp } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
const { Title, Text } = Typography;
import axios from "axios";
import {
    getAccessToken,
    storeTokens,
    getAuthHeaders,
    refreshAccessToken,
    clearTokens,
} from "../utils/tokenUtils.jsx";
import { useAuth } from "../context/AuthContext.jsx";

// temporary authentication
function tempAuth({ email, password }) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const ok = email?.includes("@") && (password?.length ?? 0) >= 6;
            ok
                ? resolve({
                      user: { email, password },
                      token: "dev-only-token",
                  })
                : reject(new Error("Invalid credentials"));
        }, 800);
    });
}

// Login card
export default function LoginPage() {
    const [submitting, setSubmitting] = useState(false);
    const { message } = AntApp.useApp();
    const navigate = useNavigate();
    const [openRegister, setOpenRegister] = useState(false);
    const { login, logout } = useAuth();

    useEffect(() => {
        clearTokens();
        logout();
    }, []);

    //register user
    async function registerUser(values) {
        console.log("New account values:", values);
        setOpenRegister(false);
        message.success("Account created");
        console.log(values);
        axios
            .post("http://localhost:3000/users/signup", {
                firstName: values.firstname,
                lastName: values.lastname,
                phone: values.phoneNumber,
                email: values.email,
                password: values.password,
            })
            .then((res) => {
                console.log(res.data);
            })
            .catch(console.err);
    }
    // temp authenticaion
    async function onFinish(values) {
        setSubmitting(true);
        try {
            const result = await tempAuth(values);
            axios
                .post("http://localhost:3000/users/signin", {
                    email: result.user.email,
                    password: result.user.password,
                })
                .then((res) => {
                    console.log(res.data);
                    if (res.data.message === "Successful login") {
                        // save access and refresh token in session storage
                        const { user, accessToken, refreshToken } = res.data;

                        login(user, accessToken, refreshToken);
                        message.success(`Welcome ${result.user.email}`);
                    } else {
                        console.log(res.data);
                    }
                })
                .catch((err) => {
                    console.log(err.response.data);
                });
        } catch (err) {
            message.error(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <ConfigProvider theme={{ algorithm: theme.defaultAlgorithm }}>
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
                ></div>

                {/* login form using ant design ui */}
                <Card style={{ width: 360 }} variant={false}>
                    <div style={{ textAlign: "center", marginBottom: 8 }}>
                        <Title level={3} style={{ marginBottom: 4 }}>
                            Sign In
                        </Title>
                        <Text type="secondary">
                            Keep Clear: Scheduling for Care
                        </Text>
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
                                {
                                    required: true,
                                    message: "Please enter your email",
                                },
                                {
                                    type: "email",
                                    message:
                                        "That doesn't look like a valid email",
                                },
                            ]}
                        >
                            <Input prefix={<UserOutlined />} />
                        </Form.Item>

                        {/* password input */}
                        <Form.Item
                            label="Password"
                            name="password"
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter your password",
                                },
                                {
                                    min: 6,
                                    message:
                                        "Password must be at least 6 characters",
                                },
                            ]}
                        >
                            <Input.Password prefix={<LockOutlined />} />
                        </Form.Item>

                        {/* remember details & forgot password button */}
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 12,
                            }}
                        >
                            <Form.Item
                                name="remember"
                                valuePropName="checked"
                                noStyle
                            >
                                <Checkbox>Remember me</Checkbox>
                            </Form.Item>
                        </div>

                        {/* sign in button */}
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            loading={submitting}
                        >
                            Sign in
                        </Button>
                    </Form>

                    {/* create user account */}
                    <div style={{ marginTop: 12, textAlign: "center" }}>
                        <Text type="secondary">
                            New user?{" "}
                            <a onClick={() => setOpenRegister(true)}>
                                Create account
                            </a>
                        </Text>
                    </div>

                    {/* pop up form to register new user*/}
                    <Modal
                        title="Create Account"
                        open={openRegister}
                        onCancel={() => setOpenRegister(false)}
                        footer={null}
                        destroyOnHidden
                    >
                        <Form layout="vertical" onFinish={registerUser}>
                            {/* user fields */}
                            <Form.Item
                                label="First Name"
                                name="firstname"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please enter your first name",
                                    },
                                ]}
                            >
                                <Input placeholder="John" />
                            </Form.Item>

                            <Form.Item
                                label="Last Name"
                                name="lastname"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please enter your last name",
                                    },
                                ]}
                            >
                                <Input placeholder="Smith" />
                            </Form.Item>

                            <Form.Item
                                label="Email"
                                name="email"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please enter your email",
                                    },
                                ]}
                            >
                                <Input placeholder="example@example.com" />
                            </Form.Item>

                            <Form.Item
                                label="Password"
                                name="password"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please enter a password",
                                    },
                                    {
                                        min: 6,
                                        message:
                                            "Password must be at least 6 charcters",
                                    },
                                ]}
                            >
                                <Input.Password placeholder="••••••••" />
                            </Form.Item>

                            <Form.Item
                                label="Phone Number"
                                name="phoneNumber"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            "Please enter your phone number",
                                    },
                                ]}
                            >
                                <Input placeholder="04xxxxxxxx" />
                            </Form.Item>

                            {/* create user button */}
                            <Button type="primary" htmlType="submit" block>
                                Create Account
                            </Button>
                        </Form>
                    </Modal>
                </Card>
            </div>
        </ConfigProvider>
    );
}

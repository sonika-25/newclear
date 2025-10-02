import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "antd/dist/reset.css";
import "./index.css";
import { App as AntApp } from "antd";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ScheduleProvider } from "./context/ScheduleContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <AntApp>
            <BrowserRouter>
                <AuthProvider>
                    <ScheduleProvider>
                        <App />
                    </ScheduleProvider>
                </AuthProvider>
            </BrowserRouter>
        </AntApp>
    </React.StrictMode>,
);

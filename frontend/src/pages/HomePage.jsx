import React, { useContext } from "react";
import LogoReact from "/src/assets/react.svg";
import { jwtDecode } from "jwt-decode";
import { getAccessToken } from "../utils/tokenUtils";
import { ScheduleContext } from "../context/ScheduleContext";

function ReactLogo({ size = 520 }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 841.9 595.3"
            fill="none"
            style={{ opacity: 0.08 }}
        >
            <g stroke="currentColor" strokeWidth="40">
                <ellipse cx="420.9" cy="296.5" rx="190" ry="380" />
                <ellipse
                    cx="420.9"
                    cy="296.5"
                    rx="190"
                    ry="380"
                    transform="rotate(60 420.9 296.5)"
                />
                <ellipse
                    cx="420.9"
                    cy="296.5"
                    rx="190"
                    ry="380"
                    transform="rotate(120 420.9 296.5)"
                />
            </g>
            <circle cx="420.9" cy="296.5" r="50" fill="currentColor" />
        </svg>
    );
}

export default function HomePage() {
    // contains schedule information
    const { selectedSchedule } = useContext(ScheduleContext);

    // contains information of logged in user
    const token = getAccessToken();
    let roles = [];
    if (token) {
        const decoded = jwtDecode(token);
        roles = decoded.role || [];
    }

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "grid",
                placeItems: "center",
                background: "#fff",
                color: "#1677ff",
            }}
        >
            <ReactLogo />
        </div>
    );
}

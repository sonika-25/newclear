import React, { createContext, useContext, useMemo, useEffect } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext.jsx";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const socket = useMemo(
        () =>
            io("http://localhost:3000", {
                transports: ["websocket"],
            }),
        [],
    );

    // Join user room when the socket connects or user changes
    useEffect(() => {
        if (!user?._id) return;

        // Join personal user room
        socket.emit("joinUserRoom", user._id);

        // Rejoin after reconnection
        socket.on("connect", () => {
            socket.emit("joinUserRoom", user._id);
        });

        return () => {
            socket.off("connect");
        };
    }, [socket, user]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);

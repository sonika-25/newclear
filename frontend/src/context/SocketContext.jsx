import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext.jsx";

const SocketContext = createContext(null);
const baseURL = 'https://newclear-1bcl.vercel.app' ;

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const socketRef = useRef(null);

    // Join user room when the socket connects or user changes
    useEffect(() => {
        if (!user?._id) {
            // If user logs out, disconnect the socket
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setSocket(null);
            }
            return;
        }

        // create a new socket for the logged in user
        const newSocket = io(baseURL, {
            transports: ["websocket"],
            auth: { userId: user._id }, // optional if backend uses token or id
        });

        socketRef.current = newSocket;
        setSocket(newSocket);

        // Join personal user room
        newSocket.on("connect", () => {
            if (user?._id) {
                newSocket.emit("joinUserRoom", user._id);

                const currentScheduleId =
                    sessionStorage.getItem("selectedSchedule");
                if (currentScheduleId) {
                    newSocket.emit("joinSchedule", currentScheduleId);
                }
            }
        });

        // Cleanup socket when user logs out or switches
        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };
    }, [user]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);

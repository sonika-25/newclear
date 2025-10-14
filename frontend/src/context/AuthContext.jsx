import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
    getAccessToken,
    storeTokens,
    getAuthHeaders,
    refreshAccessToken,
    clearTokens,
} from "../utils/tokenUtils.jsx";
import { ScheduleContext } from "./ScheduleContext.jsx";

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

// provides auth state globally
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const { setSelectedSchedule, setScheduleRole } =
        useContext(ScheduleContext);
    const navigate = useNavigate();

    // check if user is already authenticated by checking access token
    useEffect(() => {
        const initAuth = async () => {
            let token = getAccessToken();
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                // try profile with current token
                const res = await axios.get(
                    "http://localhost:3000/users/profile",
                    {
                        headers: getAuthHeaders(),
                    },
                );
                setUser(res.data);
            } catch (err) {
                if (err.response?.status === 401) {
                    try {
                        const newAccess = await refreshAccessToken();
                        if (newAccess) {
                            // update the global default headers
                            axios.defaults.headers.common["Authorization"] =
                                `Bearer ${newAccess}`;

                            storeTokens(
                                newAccess,
                                sessionStorage.getItem("refreshToken"),
                            );

                            const res2 = await axios.get(
                                "http://localhost:3000/users/profile",
                                {
                                    headers: {
                                        Authorization: `Bearer ${newAccess}`,
                                    },
                                },
                            );
                            setUser(res2.data);
                        } else {
                            logout();
                        }
                    } catch {
                        logout();
                    }
                } else {
                    logout();
                }
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    // refresh the access token when needed
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (res) => res,
            async (err) => {
                // try to refresh once upon unauthorised error
                // kick to login page if unsuccessful
                if (err.response?.status === 401) {
                    const newAccess = await refreshAccessToken();
                    if (newAccess) {
                        axios.defaults.headers.common["Authorization"] =
                            `Bearer ${newAccess}`;

                        storeTokens(
                            newAccess,
                            sessionStorage.getItem("refreshToken"),
                        );

                        // update current header
                        err.config.headers["Authorization"] =
                            `Bearer ${newAccess}`;
                        return axios(err.config);
                    } else {
                        logout();
                    }
                }
                return Promise.reject(err);
            },
        );

        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, []);

    useEffect(() => {
        // do not refresh user does not exist
        if (!user) {
            return;
        }

        // give a new access token every 14 mins
        const interval = setInterval(
            async () => {
                try {
                    await refreshAccessToken();
                    console.log("Access token refreshed proactively");
                } catch (err) {
                    console.error("Failed to refresh proactively", err);
                    logout();
                }
            },
            14 * 60 * 1000,
        );

        return () => clearInterval(interval);
    }, [user]);

    // login function
    const login = (userData, accessToken, refreshToken) => {
        console.log("Login triggered", userData, accessToken, refreshToken);
        storeTokens(accessToken, refreshToken);
        setUser(userData);
        navigate("/select");
    };

    // logout function
    const logout = () => {
        clearTokens();
        setUser(null);
        setSelectedSchedule(null);
        setScheduleRole(null);
        navigate("/login");
    };

    // go to the select schedule screen
    const selectSchedule = () => {
        setSelectedSchedule(null);
        setScheduleRole(null);
        navigate("/select-schedule", { replace: true });
    };

    return (
        <AuthContext.Provider
            value={{ user, loading, login, logout, selectSchedule }}
        >
            {children}
        </AuthContext.Provider>
    );
};

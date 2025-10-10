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

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

// provides auth state globally
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
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
                console.error("Profile fetch failed:", err);
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
                            logout("Token refresh failed on init");
                        }
                    } catch (err) {
                        logout("Refresh threw error on init");
                    }
                } else {
                    logout("Profile load error");
                }
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, [navigate]);

    // refresh the access token when needed
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (res) => res,
            async (err) => {
                // try to refresh once upon unauthorised error
                // kick to login page if unsuccessful
                const originalRequest = err.config;
                if (err.response?.status === 401 && !originalRequest._retry) {
                    // do not retry again upon unauthorised error (one refresh only)
                    originalRequest._retry = true;
                    try {
                        const newAccess = await refreshAccessToken();
                        if (newAccess) {
                            axios.defaults.headers.common["Authorization"] =
                                `Bearer ${newAccess}`;
                            storeTokens(
                                newAccess,
                                sessionStorage.getItem("refreshToken"),
                            );
                            // update current header
                            originalRequest.headers["Authorization"] =
                                `Bearer ${newAccess}`;
                            // try to refresh once
                            return axios(originalRequest);
                        }
                    } catch (e) {
                        console.error("Auto-refresh failed:", e);
                    }
                    logout("Failed to regain access");
                }
                return Promise.reject(err);
            },
        );

        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, []);

    // proactive token refresh every 14 mins
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
                } catch (err) {
                    console.error("Failed to refresh proactively", err);
                    logout("Periodic refresh failed");
                }
            },
            14 * 60 * 1000,
        );

        return () => clearInterval(interval);
    }, [user]);

    // login function
    const login = (userData, accessToken, refreshToken) => {
        storeTokens(accessToken, refreshToken);
        setUser(userData);
        navigate("/select-schedule", 0);
    };

    // logout function
    const logout = (reason) => {
        console.warn("Logging out:", reason);
        clearTokens();
        setUser(null);
        navigate("/login", { replace: true });
    };

    // go to the select schedule screen
    const selectSchedule = () => {
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

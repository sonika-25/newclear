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
        const token = getAccessToken();
        if (token) {
            axios
                .get("http://localhost:3000/users/profile", {
                    headers: getAuthHeaders(),
                })
                .then((res) => {
                    setUser(res.data);
                })
                .catch((err) => {
                    console.error("Cannot get user data", err);
                    clearTokens();
                    setUser(null);
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, []);

    // login function
    const login = (userData, accessToken, refreshToken) => {
        console.log("Login triggered", userData, accessToken, refreshToken);
        storeTokens(accessToken, refreshToken);
        setUser(userData);
        navigate("/select-schedule");
    };

    // logout function
    const logout = () => {
        clearTokens();
        setUser(null);
        navigate("/login");
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

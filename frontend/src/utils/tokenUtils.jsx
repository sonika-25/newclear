import axios from "axios";

// get access token from localStorage
export function getAccessToken() {
    return localStorage.getItem("accessToken");
}

// store access and refresh tokens in localStorage
export function storeTokens(accessToken, refreshToken) {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
}

export function clearTokens() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
}

// get authorisation headers
export function getAuthHeaders() {
    const accessToken = getAccessToken();
    return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

// refresh the access token using the refresh token
export async function refreshAccessToken() {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
        throw new Error("No refresh token found.");
    }

    try {
        const res = await axios.post("http://localhost:4000/users/token", {
            token: refreshToken,
        });
        storeTokens(res.data.accessToken, refreshToken);
        return res.data.accessToken;
    } catch (err) {
        throw new Error("Failed to refresh token.");
    }
}

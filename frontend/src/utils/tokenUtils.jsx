import axios from "axios";

// get access token from session storage
export function getAccessToken() {
    return sessionStorage.getItem("accessToken");
}

// store access and refresh tokens in session storage
export function storeTokens(accessToken, refreshToken) {
    sessionStorage.setItem("accessToken", accessToken);
    sessionStorage.setItem("refreshToken", refreshToken);
}

export function clearTokens() {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
}

// get authorisation headers
export function getAuthHeaders() {
    const accessToken = getAccessToken();
    return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

// refresh the access token using the refresh token
export async function refreshAccessToken() {
    const refreshToken = sessionStorage.getItem("refreshToken");

    if (!refreshToken) {
        throw new Error("No refresh token found.");
    }

    try {
        const res = await axios.post("http://localhost:3000/users/token", {
            token: refreshToken,
        });
        storeTokens(res.data.accessToken, refreshToken);
        return res.data.accessToken;
    } catch (err) {
        throw new Error("Failed to refresh token.");
    }
}

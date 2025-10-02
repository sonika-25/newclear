import axios from "axios";
import { getAccessToken } from "./tokenUtils";

export async function getUserByEmail(email) {
    try {
        const res = await axios.get(`http://localhost:3000/users/${encodeURIComponent(email)}`, {
            headers: {
                Authorization: `Bearer ${getAccessToken()}`,
            },
        });
        return res;
    } catch (err) {
        console.error("Error fetching user", err);
        return null;
    }
}

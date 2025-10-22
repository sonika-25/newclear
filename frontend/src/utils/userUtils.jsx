import axios from "axios";
import { getAccessToken } from "./tokenUtils";
const baseURL = 'https://newclear-1bcl.vercel.app' ;

export async function getUserByEmail(email) {
    try {
        const res = await axios.get(`${baseURL}/users/${encodeURIComponent(email)}`, {
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

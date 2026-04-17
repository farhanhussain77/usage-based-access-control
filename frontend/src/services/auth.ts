import Cookies from 'js-cookie';

export const getCurrentUser = async () => {

    const token = Cookies.get("token");

    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
        method: "GET",
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const res = await response.json();
    return res.user;
}
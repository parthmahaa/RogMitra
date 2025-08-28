import {create} from "zustand";
import API from '../Services/api';
const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: true,

  login: (user, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, token: null });
  },

  initializeAuth: async () => {
  const token = localStorage.getItem("token");
  if (!token) return set({ isLoading: false });

  try {
    const { data } = await API.get("/auth/verify", {
      headers: { Authorization: `Bearer ${token}` }
    });

    set({ user: data.user, token, isLoading: false });
  } catch (err) {
    console.error("Auth validation failed:", err.response?.data || err.message);
    // console.log("Clearing storage because token invalid"); // 👈 log here
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, token: null, isLoading: false });
  }
},
}));


export default useAuthStore
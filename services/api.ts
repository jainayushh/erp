import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const api = axios.create({
  baseURL: "https://sunvoracrm.berisphere.com",
  timeout: 15000,
});

// Attach token
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // 🔥 TOKEN IS INVALID
      await AsyncStorage.multiRemove([
        "token",
        "isLoggedIn",
        "loginAt",
      ]);
    }
    return Promise.reject(error);
  }
);

export default api;

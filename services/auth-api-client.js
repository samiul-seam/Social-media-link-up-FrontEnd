import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

const authApiClient = axios.create({
  baseURL: "http://192.168.10.40:8000/api",
});


authApiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("authTokens");
    if (token) {
      config.headers.Authorization = `JWT ${JSON.parse(token).access}`;
    }

    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data'
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export default authApiClient;  
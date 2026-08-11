import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

const authApiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL
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
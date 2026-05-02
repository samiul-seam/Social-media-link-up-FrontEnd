import axios from "axios";

const apiClient = axios.create({
    baseURL: "http://192.168.10.40:8000/api"
})

export default apiClient;
import axios from "axios";

const apiClient = axios.create({
    baseURL: "https://social-media-link-up-backend-production.up.railway.app/api/"
})

export default apiClient;
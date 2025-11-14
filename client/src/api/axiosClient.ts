import axios from "axios";
import { BACKEND_URL } from "../config/env";

const axiosClient = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


export default axiosClient;
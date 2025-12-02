import axios from "axios";
import { BACKEND_URL, CLERK_PUBLISHABLE_KEY } from "../config/env";
import { Clerk } from "@clerk/clerk-js";

const clerk = new Clerk(CLERK_PUBLISHABLE_KEY);

async function getToken() {
  if (!clerk.loaded) {
    await clerk.load();
  }
  return await clerk.session?.getToken();
}

const axiosClient = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;

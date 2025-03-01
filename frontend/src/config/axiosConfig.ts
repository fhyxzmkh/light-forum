import axios from "axios";
import useUserStore from "../store/userStore.ts";

const instance = axios.create({
  baseURL: "http://localhost:9000/api", // 设置基础 URL
});

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 从用户存储中获取 token
    const token = useUserStore.getState().token;

    // 如果 token 存在，则添加到请求头中
    if (token !== "") {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // 对请求错误做些什么
    return Promise.reject(error);
  },
);

// 导出配置好的 Axios 实例
export default instance;

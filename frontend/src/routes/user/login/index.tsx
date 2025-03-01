import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LoginForm } from "../../../components/user/LoginForm.tsx";
import { useState } from "react";
import axios from "axios";
import { message } from "antd";
import useUserStore from "../../../store/userStore.ts";

export const Route = createFileRoute("/user/login/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const setUser = useUserStore((state) => state.login);

  const login = async (values: any) => {
    setLoading(true);

    try {
      const response = await axios({
        method: "post",
        url: `http://localhost:9000/api/user/login`,
        params: {
          username: values.username,
          password: values.password,
        },
      });

      const data = response.data;

      if (data.message === "success") {
        message.success("Login successfully!");

        // 将用户信息存储到全局状态中
        const info = JSON.parse(data.userInfo);
        setUser(info.id, info.username, data.token, info.avatar, true);

        // 如果用户勾选了“记住我”，则存储账号和密码
        if (values.remember) {
          localStorage.setItem("rememberedUsername", values.username);
          localStorage.setItem("rememberedPassword", values.password);
        } else {
          // 如果用户取消勾选“记住我”，则清除存储的账号和密码
          localStorage.removeItem("rememberedUsername");
          localStorage.removeItem("rememberedPassword");
        }

        await navigate({
          to: "/home",
        });
      } else {
        message.error("Username or password is incorrect.");
      }
    } catch (error) {
      console.error("Login failed:", error);
      message.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onFinish = (values: any) => {
    login(values);
  };

  return (
    <div
      className={`w-full h-screen flex justify-end items-center bg-center bg-cover bg-[url('@assets/image/bg.jpg')]`}
    >
      <div className="w-1/4 min-w-[360px] h-auto bg-white bg-opacity-90 p-8 rounded-lg shadow-2xl mr-36">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          用户登录
        </h1>
        <LoginForm onFinish={onFinish} loading={loading} />
      </div>
    </div>
  );
}

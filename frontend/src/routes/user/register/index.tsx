import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { RegisterForm } from "../../../components/user/RegisterForm.tsx";
import axios from "axios";
import { message } from "antd";
import { useState } from "react";

export const Route = createFileRoute("/user/register/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const register = async (values: any) => {
    setLoading(true);

    try {
      const response = await axios({
        method: "post",
        url: `http://localhost:9000/api/user/register`,
        params: {
          username: values.username,
          password: values.password,
          confirm: values.confirm,
        },
      });

      const data = response.data;

      if (data.message === "success") {
        message.success("Register successfully!");
        await navigate({
          to: "/user/login",
        });
      } else {
        message.error(`${data.message}\nPlease try again.`);
      }
    } catch (error) {
      console.error("Registration failed:", error);
      message.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onFinish = (values: any) => {
    register(values);
  };

  return (
    <div
      className={`w-full h-screen flex justify-end items-center bg-center bg-cover bg-[url('@assets/image/bg.jpg')]`}
    >
      <div className="w-1/4 min-w-[360px] h-auto bg-white bg-opacity-90 p-8 rounded-lg shadow-2xl mr-36">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          用户注册
        </h1>
        <RegisterForm onFinish={onFinish} loading={loading} />
      </div>
    </div>
  );
}

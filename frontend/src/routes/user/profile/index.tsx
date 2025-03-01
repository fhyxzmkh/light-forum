import { createFileRoute, redirect } from "@tanstack/react-router";
import { Card, Form, Input, Button, message } from "antd";
import axiosInstance from "../../../config/axiosConfig";
import useUserStore from "../../../store/userStore.ts";
import { AxiosError } from "axios";

export const Route = createFileRoute("/user/profile/")({
  beforeLoad: async () => {
    const { is_login } = useUserStore.getState(); // 获取当前的 is_login 状态
    if (!is_login) {
      throw redirect({ to: "/user/login" }); // 如果用户未登录，重定向到登录页面
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const [avatarForm] = Form.useForm(); // 上传头像表单
  const [passwordForm] = Form.useForm(); // 修改密码表单

  const handleUploadAvatar = async (values: { avatarUrl: string }) => {
    const { avatarUrl } = values;

    const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif"];
    const isValidExtension = allowedExtensions.some((ext) =>
      avatarUrl.toLowerCase().endsWith(ext),
    );

    if (!isValidExtension) {
      message.error("请输入有效的图片 URL（支持 .jpg, .jpeg, .png, .gif）");
      return;
    }

    try {
      const response = await axiosInstance.post("/user/profile/uploadAvatar", {
        avatarUrl,
      });
      if (response.status === 200) {
        message.success("头像上传成功！");
      }
    } catch (error) {
      console.error("上传头像失败：", error);
      message.error("上传头像失败，请重试");
    }
  };

  const handleChangePassword = async (values: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    const { oldPassword, newPassword, confirmPassword } = values;

    if (newPassword !== confirmPassword) {
      message.error("新密码和确认密码不一致");
      return;
    }

    try {
      const response = await axiosInstance.post(
        "/user/profile/changePassword",
        {
          oldPassword,
          newPassword,
        },
      );
      if (response.status === 200) {
        message.success("密码修改成功！");
        passwordForm.resetFields();
      }
    } catch (error) {
      const e = error as AxiosError;
      if (e.response) {
        message.error(`${e.response.data}`);
      } else {
        console.error("修改密码失败：", error);
        message.error("修改密码失败，请重试");
      }
    }
  };

  return (
    <div className="w-full h-screen bg-gray-100 flex">
      <div className="w-3/5 bg-white mx-auto mt-5">
        <div className="p-4">
          <Card title="上传头像" style={{ marginBottom: 16 }}>
            <Form form={avatarForm} onFinish={handleUploadAvatar}>
              <Form.Item
                name="avatarUrl"
                label="图片 URL"
                rules={[
                  { required: true, message: "请输入图片 URL" },
                  {
                    pattern: /\.(jpg|jpeg|png|gif)$/i,
                    message:
                      "请输入有效的图片 URL（支持 .jpg, .jpeg, .png, .gif）",
                  },
                ]}
              >
                <Input placeholder="请输入图片 URL" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  上传
                </Button>
              </Form.Item>
            </Form>
          </Card>

          <Card title="修改密码">
            <Form form={passwordForm} onFinish={handleChangePassword}>
              <Form.Item
                name="oldPassword"
                label="原密码"
                rules={[{ required: true, message: "请输入原密码" }]}
              >
                <Input.Password placeholder="请输入原密码" />
              </Form.Item>
              <Form.Item
                name="newPassword"
                label="新密码"
                rules={[
                  { required: true, message: "请输入新密码" },
                  { min: 3, message: "密码长度至少为 3 位" },
                ]}
              >
                <Input.Password placeholder="请输入新密码" />
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                label="确认新密码"
                dependencies={["newPassword"]} // 依赖 newPassword 字段
                rules={[
                  { required: true, message: "请确认新密码" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("newPassword") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("新密码和确认密码不一致"),
                      );
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="请确认新密码" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  修改密码
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
}

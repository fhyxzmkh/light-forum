import { FC } from "react";
import { Button, Checkbox, Flex, Form, Input } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Link } from "@tanstack/react-router";

interface LoginFormProps {
  onFinish: (values: any) => void;
  loading: boolean;
}

export const LoginForm: FC<LoginFormProps> = ({ onFinish, loading }) => {
  const rememberedUsername = localStorage.getItem("rememberedUsername") || "";
  const rememberedPassword = localStorage.getItem("rememberedPassword") || "";

  return (
    <>
      <Form
        name="login"
        initialValues={{
          username: rememberedUsername,
          password: rememberedPassword,
          remember: !!rememberedUsername,
        }}
        onFinish={onFinish}
      >
        <Form.Item
          name="username"
          rules={[{ required: true, message: "Please input your username!" }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Username" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: "Please input your Password!" }]}
        >
          <Input
            prefix={<LockOutlined />}
            type="password"
            placeholder="Password"
          />
        </Form.Item>
        <Form.Item>
          <Flex justify="space-between" align="center">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Remember me</Checkbox>
            </Form.Item>
            {/*<a href="">Forgot password</a>*/}
          </Flex>
        </Form.Item>

        <Form.Item>
          <Button block type="primary" htmlType="submit" loading={loading}>
            Log in
          </Button>
          or <Link to="/user/register">Register now!</Link>
        </Form.Item>
      </Form>
    </>
  );
};

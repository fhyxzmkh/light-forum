import { FC } from "react";
import { Button, Checkbox, Form, Input } from "antd";
import { Link } from "@tanstack/react-router";

interface RegisterFormProps {
  onFinish: (values: any) => void;
  loading: boolean;
}

export const RegisterForm: FC<RegisterFormProps> = ({ onFinish, loading }) => {
  return (
    <>
      <Form name="register" onFinish={onFinish} scrollToFirstError>
        <Form.Item
          name="username"
          label="Username"
          tooltip="What do you want others to call you?"
          rules={[
            {
              required: true,
              message: "Please input your username!",
              whitespace: true,
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[
            {
              required: true,
              message: "Please input your password!",
            },
          ]}
          hasFeedback
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          name="confirm"
          label="Confirm"
          dependencies={["password"]}
          hasFeedback
          rules={[
            {
              required: true,
              message: "Please confirm your password!",
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("The new password that you entered do not match!"),
                );
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          name="agreement"
          valuePropName="checked"
          rules={[
            {
              validator: (_, value) =>
                value
                  ? Promise.resolve()
                  : Promise.reject(new Error("Should accept agreement")),
            },
          ]}
        >
          <Checkbox>I am not a robot</Checkbox>
        </Form.Item>

        <Form.Item>
          <Button block type="primary" htmlType="submit" loading={loading}>
            Register
          </Button>
          or Already have an account? <Link to="/user/login">Login now!</Link>
        </Form.Item>
      </Form>
    </>
  );
};

import { createFileRoute, redirect } from "@tanstack/react-router";
import useUserStore from "../../../store/userStore.ts";

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
  return (
    <>
      <div className="w-full h-screen bg-gray-100 flex">
        <div className="w-3/5 bg-white mx-auto mt-5">
          <div className="p-4"></div>
        </div>
      </div>
    </>
  );
}

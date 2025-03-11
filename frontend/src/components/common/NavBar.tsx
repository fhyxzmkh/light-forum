import { useState } from "react"; // 引入 useState
import { Menu, MenuProps, Dropdown, Avatar, Typography } from "antd";
import { Header } from "antd/es/layout/layout";
import {
  UserOutlined,
  LogoutOutlined,
  CaretDownOutlined,
  SettingOutlined,
  HomeOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { MenuItemType } from "antd/es/menu/interface";
import useUserStore from "../../store/userStore.ts";
import { useNavigate } from "@tanstack/react-router";
import Search from "antd/es/input/Search";

const { Text } = Typography;

export const NavBar = () => {
  const navigate = useNavigate();
  const logout = useUserStore((state) => state.logout);
  const userAvatar = useUserStore((state) => state.avatar);
  const [selectedKeys, setSelectedKeys] = useState<string[]>(["home"]); // 状态管理选中的菜单项
  const { id, username } = useUserStore.getState();

  const handleLogout = () => {
    logout();
    navigate({
      to: "/user/login",
    });
    setSelectedKeys([]); // 清空高亮状态
  };

  const handleClickProfile = () => {
    navigate({
      to: `/user/profile/${id}`,
    });
    setSelectedKeys([]); // 清空高亮状态
  };

  const handleClickSetting = () => {
    navigate({
      to: "/user/settings",
    });
    setSelectedKeys([]); // 清空高亮状态
  };

  const handleClickHome = () => {
    navigate({
      to: "/home",
    });
    setSelectedKeys(["home"]); // 设置首页为高亮状态
  };

  const handleClickMessages = () => {
    navigate({
      to: "/message",
    });
    setSelectedKeys(["messages"]); // 设置消息为高亮状态
  };

  // 导航栏菜单
  const items: MenuProps["items"] = [
    {
      key: "home",
      label: "首页",
      icon: <HomeOutlined />,
      onClick: handleClickHome,
    },
    {
      key: "messages",
      label: "消息",
      icon: <MessageOutlined />,
      onClick: handleClickMessages,
    },
  ];

  // 用户下拉菜单的选项
  const userMenuItems: MenuItemType[] = [
    {
      key: "profile",
      label: "个人主页",
      icon: <UserOutlined />,
      onClick: handleClickProfile,
    },
    {
      key: "settings",
      label: "账号设置",
      icon: <SettingOutlined />,
      onClick: handleClickSetting,
    },
    {
      key: "logout",
      label: "退出登录",
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  return (
    <Header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-evenly",
        width: "100%",
      }}
    >
      {/* 左侧区域：Logo */}
      <div className="text-white font-bold text-xl">轻论坛</div>

      {/* 中间区域：菜单 */}
      <Menu
        theme="dark"
        mode="horizontal"
        selectedKeys={selectedKeys} // 绑定选中的菜单项
        items={items}
        style={{ flex: 1, minWidth: 0, maxWidth: 400 }}
      />

      {/* 搜索框 */}
      <Search
        placeholder="搜索..."
        style={{ width: 240, margin: "0 16px" }}
        onSearch={(value) => console.log(value)}
      />

      {/* 右侧区域：用户头像和用户名（下拉菜单） */}
      <Dropdown menu={{ items: userMenuItems }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
          }}
        >
          {userAvatar === "" ? (
            <Avatar icon={<UserOutlined />} />
          ) : (
            <Avatar src={userAvatar} />
          )}
          <Text strong style={{ color: "white" }}>
            {username}
          </Text>
          <CaretDownOutlined style={{ color: "white" }} />
        </div>
      </Dropdown>
    </Header>
  );
};

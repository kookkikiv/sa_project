import React, { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import "../../App.css";
import { UserOutlined, DashboardOutlined, HomeOutlined, GlobalOutlined } from "@ant-design/icons";
import { Breadcrumb, Layout, Menu, theme, Button, message } from "antd";
import logo from "../../assets/logo.png";

const { Header, Content, Footer, Sider } = Layout;

const FullLayout: React.FC = () => {
  const page = localStorage.getItem("page");
  const [messageApi, contextHolder] = message.useMessage();
  const [collapsed, setCollapsed] = useState(false);

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const setCurrentPage = (val: string) => {
    localStorage.setItem("page", val);
  };

  const Logout = () => {
    localStorage.clear();
    messageApi.success("Logout successful");
    setTimeout(() => {
      location.href = "/";
    }, 2000);
  };

  // แก้ไข: ย้าย items ออกมาข้างนอก และแก้ไข syntax
  const items = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: <Link to="/">แดชบอร์ด</Link>,
      onClick: () => setCurrentPage("dashboard"),
    },
    {
      key: "admin",
      icon: <UserOutlined />,
      label: <Link to="/admin">ข้อมูลสมาชิก</Link>,
      onClick: () => setCurrentPage("admin"),
    },
    {
      key: "accommodation", // แก้ไขการสะกด
      icon: <HomeOutlined />,
      label: <Link to="/accommodation">ข้อมูลที่พัก</Link>, // แก้ไข path
      onClick: () => setCurrentPage("accommodation"),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {contextHolder}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "100%",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: 20,
                marginBottom: 20,
              }}
            >
              <img
                src={logo}
                alt="Logo"
                style={{ width: "80%" }}
              />
            </div>

            {/* แก้ไข: ใช้ Menu component อย่างเดียว */}
            <Menu
              theme="dark"
              defaultSelectedKeys={[page ? page : "dashboard"]}
              mode="inline"
              items={items}
            />
          </div>

          <Button onClick={Logout} style={{ margin: 4 }}>
            ออกจากระบบ
          </Button>
        </div>
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }} />
        <Content style={{ margin: "0 16px" }}>
          <Breadcrumb style={{ margin: "16px 0" }} />
          <div
            style={{
              padding: 24,
              minHeight: "100%",
              background: colorBgContainer,
            }}
          >
            {/* ลบ nested Routes ออก - ให้ AdminRoutes จัดการแทน */}
            <Outlet />
          </div>
        </Content>

        <Footer style={{ textAlign: "center" }}>
          System Analysis and Design        
        </Footer>
      </Layout>
    </Layout>
  );
};

export default FullLayout;
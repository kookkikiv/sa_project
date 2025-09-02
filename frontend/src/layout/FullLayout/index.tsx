import React, { useState, useMemo } from "react";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import type { MenuProps } from "antd";
import "../../App.css";
import {
  UserOutlined,
  DashboardOutlined,
  HomeOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { Breadcrumb, Layout, Menu, theme, Button, message } from "antd";
import logo from "../../assets/logo.png";
import Dashboard from "../../pages/dashboard";
import Admin from "../../pages/Admin";
import AdminCreate from "../../pages/Admin/create";
import AdminEdit from "../../pages/Admin/edit";
import Accommodation from "../../pages/Accommodation";
import AccommodationCreate from "../../pages/Accommodation/create";
import AccommodationEdit from "../../pages/Accommodation/edit";
import Room from "../../pages/Room";
import RoomCreate from "../../pages/Room/create";
import RoomEdit from "../../pages/Room/edit";
import Facility from "../../pages/Facility";
import FacilityCreate from "../../pages/Facility/create";
import FacilityEdit from "../../pages/Facility/edit";
import Package from "../../pages/Package";
import PackageCreate from "../../pages/Package/create";
import PackageEdit from "../../pages/Package/edit";

const { Header, Content, Footer, Sider } = Layout;

const FullLayout: React.FC = () => {
  const routerLocation = useLocation();         
  const navigate = useNavigate();                
  const path = routerLocation.pathname;

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
      navigate("/");
    }, 1200);
  };

  const selectedKey = useMemo<string>(() => {
    if (path.startsWith("/accommodation/room")) return "accommodation/room";
    if (path.startsWith("/accommodation/facility")) return "accommodation/facility";
    if (path.startsWith("/accommodation")) return "accommodation/list";
    if (path.startsWith("/admin")) return "admin";
    if (path.startsWith("/package")) return "package";
    return "dashboard";
  }, [path]);

  const [openKeys, setOpenKeys] = useState<string[]>(
    path.startsWith("/accommodation") ? ["accommodation"] : []
  );

  const onOpenChange: MenuProps["onOpenChange"] = (keys) => {
    setOpenKeys(keys as string[]);
  };

  const items: MenuProps["items"] = [
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
      key: "accommodation",
      icon: <HomeOutlined />,
      label: "ข้อมูลที่พัก",
      children: [
        {
          key: "accommodation/list",
          icon: <HomeOutlined />,
          label: <Link to="/accommodation">ที่พัก</Link>,
          onClick: () => setCurrentPage("accommodation"),
        },
        {
          key: "accommodation/room",
          icon: <HomeOutlined />,
          label: <Link to="/accommodation/room">ห้อง</Link>,
          onClick: () => setCurrentPage("accommodation-room"),
        },
        {
          key: "accommodation/facility",
          icon: <HomeOutlined />,
          label: <Link to="/accommodation/facility">สิ่งอำนวยความสะดวก</Link>,
          onClick: () => setCurrentPage("accommodation-facility"),
        },
      ],
    },
    {
      key: "package",
      icon: <GlobalOutlined />,
      label: <Link to="/package">ข้อมูลแพ็คเกจ</Link>,
      onClick: () => setCurrentPage("package"),
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
              <img src={logo} alt="Logo" style={{ width: "80%" }} />
            </div>

            <Menu
              theme="dark"
              mode="inline"
              items={items}
              selectedKeys={[selectedKey]}
              openKeys={openKeys}
              onOpenChange={onOpenChange}
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
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/create" element={<AdminCreate />} />
              <Route path="/admin/edit/:id" element={<AdminEdit />} />
              
              {/* Accommodation Routes */}
              <Route path="/accommodation" element={<Accommodation />} />
              <Route path="/accommodation/create" element={<AccommodationCreate />} />
              <Route path="/accommodation/edit/:id" element={<AccommodationEdit />} />
              
              {/* Room Routes - ใช้ path ที่ถูกต้อง */}
              <Route path="/accommodation/room" element={<Room />} />
              <Route path="/accommodation/room/create" element={<RoomCreate />} />
              <Route path="/accommodation/room/edit/:id" element={<RoomEdit />} />
              
              {/* Facility Routes - ใช้ path ที่ถูกต้อง */}
              <Route path="/accommodation/facility" element={<Facility />} />
              <Route path="/accommodation/facility/create" element={<FacilityCreate />} />
              <Route path="/accommodation/facility/edit/:id" element={<FacilityEdit />} />
              
              {/* Package Routes */}
              <Route path="/package" element={<Package />} />
              <Route path="/package/create" element={<PackageCreate />} />
              <Route path="/package/edit/:id" element={<PackageEdit />} />
            </Routes>
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
import userlogo from "../assets/user.png";
import "./system.css";
import { Button } from "antd";
import { useState } from "react";
import { AccDataUI } from "./Accommodation";
import { PacDataUI } from "./Package";

export function SystemDataUI() {
  const [selectedMenu, setSelectedMenu] = useState("system");

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "220px",
          backgroundColor: "#f0f0f0",
          padding: "20px",
          borderRight: "1px solid #ccc",
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          zIndex: 1000
        }}
      >
        <div style={{ textAlign: "center" }}>
          <img src={userlogo} alt="user" style={{ width: "80px", marginBottom: "10px" }} />
          <p>
            <b>Admin01</b>
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
          <Button type={selectedMenu === "Admin" ? "primary" : "default"} onClick={() => setSelectedMenu("Admin")}>
            ข้อมูลผู้ใช้
          </Button>
          <Button type={selectedMenu === "accommodation" ? "primary" : "default"} onClick={() => setSelectedMenu("accommodation")}>
            ข้อมูลที่พัก
          </Button>
          <Button type={selectedMenu === "package" ? "primary" : "default"} onClick={() => setSelectedMenu("package")}>
            ข้อมูลแพ็คเกจ
          </Button>
          <Button danger>ออกจากระบบ</Button>
        </div>
      </div>

      {/* Main Content - เพิ่ม marginLeft */}
      <div style={{ 
        flex: 1, 
        padding: "30px", 
        marginLeft: "220px",
        minHeight: "100vh",
        boxSizing: "border-box"
      }}>
        {selectedMenu === "Admin" && <p>แสดงข้อมูลadmin</p>}
        {selectedMenu === "accommodation" && <AccDataUI />}
        {selectedMenu === "package" && <PacDataUI />}
      </div>
    </div>
  );
}
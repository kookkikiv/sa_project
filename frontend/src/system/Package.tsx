import userlogo from "../assets/user.png";
import "./system.css";
import { Button } from "antd";
import { useState } from "react";
import { SystemDataUI } from "./system";
import  AddUI  from "./create/Package";

export function PacDataUI() {
  const [selectedMenu, setSelectedMenu] = useState("package");

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "220px",
          backgroundColor: "#f0f0f0",
          padding: "20px",
          borderRight: "1px solid #ccc",
          position: "fixed",      // ✅ ล็อกไว้ที่มุมซ้ายบน
          top: 0,
          left: 0,
          height: "100vh",        // ✅ เต็มความสูงจอ
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
          <Button type={selectedMenu === "back" ? "primary" : "default"} onClick={() => setSelectedMenu("back")}>
            ย้อนกลับ
          </Button>
          <Button type={selectedMenu === "package" ? "primary" : "default"} onClick={() => setSelectedMenu("package")}>
            ข้อมูลแพ็คเกจ
          </Button>
          <Button danger>ออกจากระบบ</Button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "30px" }}>
        {selectedMenu === "back" && <SystemDataUI />}
        {selectedMenu === "package" && <PackageUI />}
      </div>
    </div>
  );
}

export function PackageUI() {
  const [selectedMenu, setSelectedMenu] = useState("package");

 const facilities: { id: number | null; name: string | null; status: string | null }[] = [];

  // เพิ่ม condition เพื่อแสดงหน้าเพิ่มข้อมูล
  if (selectedMenu === "add") {
    return (
      <div>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px"
        }}>
          <h2>เพิ่มข้อมูลที่พัก</h2>
          <button
            onClick={() => setSelectedMenu("package")}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              cursor: "pointer",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "5px",
            }}
          >
            กลับ
          </button>
        </div>
        <AddUI />
      </div>
    );
  }

  // แสดงตารางหรือข้อความว่างเปล่า
  return (
    <div>
      <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px"
      }}>
        <h2>จัดการข้อมูลแพ็คเกจ</h2>
        <button
          onClick={() => setSelectedMenu("add")}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
          }}
        >
          เพิ่มข้อมูล
        </button>
      </div>

      {facilities.length > 0 ? (
        <table style={{
          width: "100%",
          borderCollapse: "collapse",
          minHeight: "400px",
        }}>
          <thead>
            <tr style={{ backgroundColor: "#f2f2f2" }}>
              <th style={{ padding: "10px", border: "1px solid #ccc", textAlign: "left" }}>ID</th>
              <th style={{ padding: "10px", border: "1px solid #ccc", textAlign: "left" }}>ชื่อแพ็คเกจ</th>
              <th style={{ padding: "10px", border: "1px solid #ccc", textAlign: "left" }}>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {facilities.map((facility, index) => (
              <tr key={index}>
                <td style={{ padding: "10px", border: "1px solid #ccc" }}>{facility.id}</td>
                <td style={{ padding: "10px", border: "1px solid #ccc" }}>{facility.name}</td>
                <td style={{ padding: "10px", border: "1px solid #ccc" }}>{facility.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{
          height: "300px",
          border: "1px solid #ccc",
          borderRadius: "10px",
          padding: "80px",
          backgroundColor: "#fafafa",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#888",
        }}>
          ไม่มีข้อมูลที่พัก
        </div>
      )}
    </div>
  );
}

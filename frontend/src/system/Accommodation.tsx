import userlogo from "../assets/user.png";
import "./system.css";
import { Button } from "antd";
import { useState } from "react";
import { SystemDataUI } from "./system";
import  AddUI  from "./create/Accommodation";

export function AccDataUI() {
  const [selectedMenu, setSelectedMenu] = useState("accommodation");

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
          <Button type={selectedMenu === "back" ? "primary" : "default"} onClick={() => setSelectedMenu("back")}>
            ย้อนกลับ
          </Button>
          <Button type={selectedMenu === "info" ? "primary" : "default"} onClick={() => setSelectedMenu("info")}>
            ข้อมูลที่พัก
          </Button>
          <Button type={selectedMenu === "accommodation" ? "primary" : "default"} onClick={() => setSelectedMenu("accommodation")}>
            ที่พัก
          </Button>
          <Button type={selectedMenu === "room" ? "primary" : "default"} onClick={() => setSelectedMenu("room")}>
            ห้องพัก
          </Button>
          <Button type={selectedMenu === "facility" ? "primary" : "default"} onClick={() => setSelectedMenu("facility")}>
            สิ่งอำนวยความสะดวก
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
        {selectedMenu === "back" && <SystemDataUI />}
        {selectedMenu === "accommodation" && <AccommodationUI />}
        {selectedMenu === "info" && <p>แสดงข้อมูลที่พัก</p>}
        {selectedMenu === "room" && <RoomUI />}
        {selectedMenu === "facility" && <FacilityUI />}
      </div>
    </div>
  );
}

export function AccommodationUI() {
  const [selectedMenu, setSelectedMenu] = useState("accommodation");

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
            onClick={() => setSelectedMenu("accommodation")}
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
        <h2>จัดการข้อมูลที่พัก</h2>
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
              <th style={{ padding: "10px", border: "1px solid #ccc", textAlign: "left" }}>ชื่อที่พัก</th>
              <th style={{ padding: "10px", border: "1px solid #ccc", textAlign: "left" }}>ลักษณะที่พัก</th>
              <th style={{ padding: "10px", border: "1px solid #ccc", textAlign: "left" }}>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {facilities.map((facility, index) => (
              <tr key={index}>
                <td style={{ padding: "10px", border: "1px solid #ccc" }}>{facility.id}</td>
                <td style={{ padding: "10px", border: "1px solid #ccc" }}>{facility.name}</td>
                <td style={{ padding: "10px", border: "1px solid #ccc" }}>{facility.status}</td>
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

export function RoomUI() {
  
  const facilities = [
    { id: null, name: null, status: null},
    { id: null, name: null, status: null },
    { id: null, name: null, status: null},
    { id: null, name: null, status: null},
    { id: null, name: null, status: null },
    { id: null, name: null, status: null},
    { id: null, name: null, status: null},
    { id: null, name: null, status: null },
    { id: null, name: null, status: null},
  ];

  return (
    <div>
      <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px"
      }}>
        <h2>จัดการข้อมูลห้องพัก</h2>
        <button
          onClick={() => alert("คลิกเพิ่มข้อมูล")}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            right:10,
          }}
        >
          เพิ่มข้อมูล
        </button>
      </div>

      {facilities.length > 0 ? (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minHeight: "400px",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f2f2f2" }}>
              <th style={{ padding: "10px", border: "1px solid #ccc", textAlign: "left" }}>ID</th>
              <th style={{ padding: "10px", border: "1px solid #ccc", textAlign: "left" }}>ชื่อห้องพัก</th>
              <th style={{ padding: "10px", border: "1px solid #ccc", textAlign: "left" }}>ลักษญะห้องพัก</th>
              <th style={{ padding: "10px", border: "1px solid #ccc", textAlign: "left" }}>ลักษญะเตียง</th>
              <th style={{ padding: "10px", border: "1px solid #ccc", textAlign: "left" }}>ราคา</th>
              <th style={{ padding: "10px", border: "1px solid #ccc", textAlign: "left" }}>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {facilities.map((facility) => (
              <tr key={facility.id}>
                <td style={{ padding: "10px", border: "1px solid #ccc" }}>{facility.id}</td>
                <td style={{ padding: "10px", border: "1px solid #ccc" }}>{facility.name}</td>
                <td style={{ padding: "10px", border: "1px solid #ccc" }}>{facility.status}</td>
                <td style={{ padding: "10px", border: "1px solid #ccc" }}>{facility.id}</td>
                <td style={{ padding: "10px", border: "1px solid #ccc" }}>{facility.name}</td>
                <td style={{ padding: "10px", border: "1px solid #ccc" }}>{facility.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div
          style={{
            height: "300px",
            border: "1px solid #ccc",
            borderRadius: "10px",
            padding: "80px",
            backgroundColor: "#fafafa",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "#888",
          }}
        >
          ยังไม่มีข้อมูลในตาราง
        </div>
      )}
    </div>
  );
}

export function FacilityUI() {
  // สมมติว่ามีข้อมูลสิ่งอำนวยความสะดวก
  const facilities = [
    { id: null, name: null, status: null},
    { id: null, name: null, status: null },
    { id: null, name: null, status: null},
    { id: null, name: null, status: null},
    { id: null, name: null, status: null },
    { id: null, name: null, status: null},
    { id: null, name: null, status: null},
    { id: null, name: null, status: null },
    { id: null, name: null, status: null},
  ];

  return (
    <div>
      <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px"
      }}>
        <h2>จัดการข้อมูลสิ่งอำนวยความสะดวก</h2>
        <button
          onClick={() => alert("คลิกเพิ่มข้อมูล")}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            right:10,
          }}
        >
          เพิ่มข้อมูล
        </button>
      </div>

      {facilities.length > 0 ? (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minHeight: "400px",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f2f2f2" }}>
              <th style={{ padding: "10px", border: "1px solid #ccc", textAlign: "left" }}>ID</th>
              <th style={{ padding: "10px", border: "1px solid #ccc", textAlign: "left" }}>ชื่อสิ่งอำนวยความสะดวก</th>
              <th style={{ padding: "10px", border: "1px solid #ccc", textAlign: "left" }}>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {facilities.map((facility) => (
              <tr key={facility.id}>
                <td style={{ padding: "10px", border: "1px solid #ccc" }}>{facility.id}</td>
                <td style={{ padding: "10px", border: "1px solid #ccc" }}>{facility.name}</td>
                <td style={{ padding: "10px", border: "1px solid #ccc" }}>{facility.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div
          style={{
            height: "300px",
            border: "1px solid #ccc",
            borderRadius: "10px",
            padding: "80px",
            backgroundColor: "#fafafa",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "#888",
          }}
        >
          ยังไม่มีข้อมูลในตาราง
        </div>
      )}
    </div>
  );
}
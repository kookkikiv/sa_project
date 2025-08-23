import { useState } from 'react';
import {createRoot} from "react-dom/client";
import {APIProvider, Map} from '@vis.gl/react-google-maps';

export default function AddUI() {
  const [formData, setFormData] = useState({
    Name: '',
    Accommodation: '',
    Location: '',
    Status: '',
    Type: '',
  });

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    alert('ข้อมูลถูกบันทึกแล้ว');
  };

  const handleCancel = () => {
    setFormData({
      Name: '',
      Accommodation: '',
      Location: '',
      Status: '',
      Type: '',

    });
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "24px", marginBottom: "30px", fontWeight: "bold" }}>
        เพิ่มข้อมูลที่พัก
      </h1>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "20px",
        marginBottom: "30px"
      }}>
        {/* ชื่อที่พัก*/}
        <div style={{ gridColumn: "span 2" }}>
          <label htmlFor="Name">ชื่อที่พัก <span style={{ color: "red" }}>*</span></label>
          <input
            type="text"
            id="Name"
            name="Name"
            value={formData.Name}
            onChange={handleInputChange}
            required
            style={inputStyle}
          />
        </div>
          {/* typeที่พัก*/}
        <div>
          <label htmlFor="Type">ลักษณะที่พัก <span style={{ color: "red" }}>*</span></label>
          <select
            id="Type"
            name="Type"
            value={formData.Type}
            onChange={handleInputChange}
            required
            style={inputStyle}
          >
            <option value="">กรุณาเลือกลักษณะที่พัก</option>
            <option value="โรงแรม">โรงแรม</option>
            <option value="รีสอร์ท">รีสอร์ท</option>
            <option value="โฮสเทล">โฮสเทล</option>
          </select>
        </div>

        {/* สถานที่ */}
        <div>
          <label htmlFor="Location">สถานที่ <span style={{ color: "red" }}>*</span></label>
          <select
            id="Location"
            name="Location"
            value={formData.Location}
            onChange={handleInputChange}
            required
            style={inputStyle}
          >
            <option value="">กรุณาเลือกสถานที่</option>
            <option value="กทม">กทม</option>
            <option value="เชียงใหม่">เชียงใหม่</option>
            <option value="อื่นๆ">อื่นๆ</option>
          </select>
        </div>

        {/* สถานะ */}
        <div>
          <label htmlFor="Status">สถานะ <span style={{ color: "red" }}>*</span></label>
          <select
            id="Status"
            name="Status"
            value={formData.Status}
            onChange={handleInputChange}
            required
            style={inputStyle}
          >
            <option value="">กรุณาเลือกสถานะ</option>
            <option value="เปิดใช้บริการ">เปิดใช้บริการ</option>
            <option value="ปิดปรับปรุง">ปิดปรับปรุง</option>
          </select>
        </div>
      </div>

      {/* ปุ่ม */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
        <button onClick={handleCancel} style={cancelButtonStyle}>ยกเลิก</button>
        <button onClick={handleSubmit} style={submitButtonStyle}>บันทึก</button>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px",
  border: "1px solid #ddd",
  borderRadius: "4px",
  fontSize: "14px",
  boxSizing: "border-box",
  backgroundColor: "white"
};

const unitStyle: React.CSSProperties = {
  position: "absolute",
  right: "10px",
  top: "50%",
  transform: "translateY(-50%)",
  color: "#666",
  fontSize: "14px"
};

const cancelButtonStyle: React.CSSProperties = {
  padding: "10px 20px",
  backgroundColor: "#6c757d",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "14px"
};

const submitButtonStyle: React.CSSProperties = {
  padding: "10px 20px",
  backgroundColor: "#007bff",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "14px"
};

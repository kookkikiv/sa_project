import { useState } from 'react';

export default function AddUI() {
  const [formData, setFormData] = useState({
    Name: '',
    Accommodation: '',
    Location: '',
    Status: '',
    Price: '',
    Quantity: '',
    OpenDate: '',
    CloseDate: ''
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
      Price: '',
      Quantity: '',
      OpenDate: '',
      CloseDate: ''
    });
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "24px", marginBottom: "30px", fontWeight: "bold" }}>
        เพิ่มข้อมูลแพ็คเกจ
      </h1>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "20px",
        marginBottom: "30px"
      }}>
        {/* ชื่อแพ็คเกจ */}
        <div style={{ gridColumn: "span 2" }}>
          <label htmlFor="Name">ชื่อแพ็คเกจ <span style={{ color: "red" }}>*</span></label>
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

        {/* ราคาเริ่มต้น */}
        <div>
          <label htmlFor="Price">ราคาเริ่มต้น</label>
          <div style={{ position: "relative" }}>
            <input
              type="number"
              id="Price"
              name="Price"
              value={formData.Price}
              onChange={handleInputChange}
              style={{ ...inputStyle, paddingRight: "40px" }}
            />
            <span style={unitStyle}>บาท</span>
          </div>
        </div>

        {/* จำนวนคน */}
        <div>
          <label htmlFor="Quantity">จำนวนคน</label>
          <input
            type="number"
            id="Quantity"
            name="Quantity"
            value={formData.Quantity}
            onChange={handleInputChange}
            style={inputStyle}
          />
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

        {/* ที่พัก */}
        <div style={{ gridColumn: "span 2" }}>
          <label htmlFor="Accommodation">ที่พัก <span style={{ color: "red" }}>*</span></label>
          <input
            type="text"
            id="Accommodation"
            name="Accommodation"
            value={formData.Accommodation}
            onChange={handleInputChange}
            required
            style={inputStyle}
          />
        </div>

        {/* วันที่เริ่ม */}
        <div>
          <label htmlFor="OpenDate">วันที่เริ่ม <span style={{ color: "red" }}>*</span></label>
          <input
            type="date"
            id="OpenDate"
            name="OpenDate"
            value={formData.OpenDate}
            onChange={handleInputChange}
            required
            style={inputStyle}
          />
        </div>

        {/* วันที่สิ้นสุด */}
        <div>
          <label htmlFor="CloseDate">วันที่สิ้นสุด <span style={{ color: "red" }}>*</span></label>
          <input
            type="date"
            id="CloseDate"
            name="CloseDate"
            value={formData.CloseDate}
            onChange={handleInputChange}
            required
            style={inputStyle}
          />
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

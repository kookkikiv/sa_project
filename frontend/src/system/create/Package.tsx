import { useState } from 'react';

export default function AddUI() {
  const [formData, setFormData] = useState({
    Name: '',
    Type: '',
    Location: '',
    Status: ''
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
      Type: '',
      Location: '',
      Status: ''
    });
  };

  return (
    <div className="system-container bg-gray-100 min-h-screen py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-8">
        <div className="system-header">
          <img src="/icon.png" alt="icon" className="system-icon" />
          <h1 className="header text-gray-80จ">เพิ่มข้อมูลที่พัก</h1>
        </div>

        <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ชื่อที่พัก */}
          <div>
            <label htmlFor="Name" className="block text-sm font-medium text-gray-700 mb-1">
              ชื่อแพ็คเกจ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="Name"
              name="Name"
              value={formData.Name}
              onChange={handleInputChange}
              required
              className="input border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* ลักษณะ */}
          <div>
            <label htmlFor="Type" className="block text-sm font-medium text-gray-700 mb-1">
              ที่พัก <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="Type"
              name="Type"
              value={formData.Type}
              onChange={handleInputChange}
              required
              className="input border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* สถานที่ */}
          <div>
            <label htmlFor="Location" className="block text-sm font-medium text-gray-700 mb-1">
              สถานที่ <span className="text-red-500">*</span>
            </label>
            <select
              id="Location"
              name="Location"
              value={formData.Location}
              onChange={handleInputChange}
              required
              className="input border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
            >
              <option value="">กรุณาเลือกสถานที่</option>
              <option value="กทม">กทม</option>
              <option value="เชียงใหม่">เชียงใหม่</option>
              <option value="อื่นๆ">อื่นๆ</option>
            </select>
          </div>

          {/* สถานะ */}
          <div>
            <label htmlFor="Status" className="block text-sm font-medium text-gray-700 mb-1">
              สถานะ <span className="text-red-500">*</span>
            </label>
            <select
              id="Status"
              name="Status"
              value={formData.Status}
              onChange={handleInputChange}
              required
              className="input border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
            >
              <option value="">กรุณาเลือกสถานะ</option>
              <option value="เปิดใช้บริการ">เปิดใช้บริการ</option>
              <option value="ปิดปรับปรุง">ปิดปรับปรุง</option>
            </select>
          </div>
        </form>

        {/* ปุ่ม */}
        <div className="flex justify-end gap-4 mt-8">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            บันทึก
          </button>
        </div>
      </div>
    </div>
  );
}

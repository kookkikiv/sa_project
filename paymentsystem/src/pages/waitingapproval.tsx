import React from "react";
import { Typography, Button, Card, Descriptions, Tag } from "antd";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const { Title } = Typography;

const WaitingApproval: React.FC = () => {
  const navigate = useNavigate();

  const applicationData = {
    firstName: "Somchai",
    lastName: "Jaidee",
    age: 28,
    sex: "Male",
    phone: "0812345678",
    email: "somchai@example.com",
    language: "Thai, English",
    serviceArea: "Bangkok",
    submittedAt: "2025-08-29 10:30",
    status: "กำลังรอการอนุมัติ",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: 20,
        background: "linear-gradient(135deg, #e0f7fa, #ffffff)",
      }}
    >
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, delay: 0.3 }}
      >
        <Title level={2}>📄 ใบสมัครของคุณกำลังรอการอนุมัติ</Title>
      </motion.div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        style={{ marginTop: 24, width: "100%", maxWidth: 600 }}
      >
        <Card
          bordered={false}
          style={{
            borderRadius: 16,
            boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
            background: "rgba(255,255,255,0.85)",
          }}
        >
          <Descriptions
            title="ข้อมูลการสมัคร"
            bordered
            column={1}
            labelStyle={{ fontWeight: "bold", width: "30%" }}
          >
            <Descriptions.Item label="ชื่อ - สกุล">
              {applicationData.firstName} {applicationData.lastName}
            </Descriptions.Item>
            <Descriptions.Item label="อายุ">
              {applicationData.age}
            </Descriptions.Item>
            <Descriptions.Item label="เพศ">
              {applicationData.sex}
            </Descriptions.Item>
            <Descriptions.Item label="เบอร์โทร">
              {applicationData.phone}
            </Descriptions.Item>
            <Descriptions.Item label="อีเมล">
              {applicationData.email}
            </Descriptions.Item>
            <Descriptions.Item label="ภาษา">
              {applicationData.language}
            </Descriptions.Item>
            <Descriptions.Item label="พื้นที่บริการ">
              {applicationData.serviceArea}
            </Descriptions.Item>
            <Descriptions.Item label="เวลาที่ส่ง">
              {applicationData.submittedAt}
            </Descriptions.Item>
            <Descriptions.Item label="สถานะ">
              <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center", // ทำให้ข้อความอยู่ตรงกลาง
      gap: 8,
      fontSize: 18,
      fontWeight: "bold",
      color: "#1890ff", // ใช้สีข้อความแทนพื้นหลัง
    }}
  >
    <motion.span
      animate={{ rotate: 360 }}
      transition={{
        repeat: Infinity,
        duration: 2,
        ease: "linear",
      }}
      style={{ display: "inline-block" }}
    >
      ⏳
    </motion.span>
    {applicationData.status}
  </div>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Button
          type="primary"
          size="large"
          style={{ marginTop: 32, borderRadius: 8 }}
          onClick={() => navigate("/home")}
        >
          กลับไปหน้าหลัก
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default WaitingApproval;

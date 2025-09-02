import React from "react";
import { useLocation } from "react-router-dom";
import { Typography, Divider, Tag } from "antd";

const { Title, Text } = Typography;

const ApplicationResult: React.FC = () => {
  const location = useLocation();
  const data = location.state?.data || {};

  const statusColor =
    data.status === "approved"
      ? "green"
      : data.status === "rejected"
      ? "red"
      : "orange";

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "#f0f2f5",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 800,
          borderRadius: 16,
          background: "#fff",
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          padding: 40,
          textAlign: "center",
        }}
      >
        <Title level={2}>🎉 ผลการสมัคร</Title>
        <Divider />
        <Text><strong>ชื่อ:</strong> {data.firstName || "-"} {data.lastName || "-"}</Text><br/>
        <Text><strong>อายุ:</strong> {data.age || "-"}</Text><br/>
        <Text><strong>เพศ:</strong> {data.gender || "-"}</Text><br/>
        <Text><strong>โทรศัพท์:</strong> {data.phone || "-"}</Text><br/>
        <Text><strong>อีเมล:</strong> {data.email || "-"}</Text>
        <Divider />
        <Text><strong>ประเภทไกด์:</strong> {data.GT || "-"}</Text><br/>
        <Text><strong>ภูมิภาค:</strong> {data.RG || "-"}</Text><br/>
        <Text><strong>จังหวัด:</strong> {data.PV || "-"}</Text><br/>
        <Text><strong>อำเภอ:</strong> {data.DT || "-"}</Text><br/>
        <Text><strong>เอกสาร:</strong> {data.documentsPath ? "อัปโหลดแล้ว" : "ยังไม่อัปโหลด"}</Text>
        <Divider />
        <Tag
          color={statusColor}
          style={{ fontSize: 16, padding: "10px 20px", borderRadius: 12 }}
        >
          {data.status ? data.status.toUpperCase() : "รออนุมัติ"}
        </Tag>
      </div>
    </div>
  );
};

export default ApplicationResult;

// src/pages/Facility/index.tsx
import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Col,
  Row,
  Divider,
  message,
  Popconfirm,
} from "antd";
import { PlusOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { Link, useNavigate } from "react-router-dom";

const apiUrl = "http://localhost:8000";

// ---- Types ----
type MaybeName = { ID?: number; Name?: string; name?: string } | undefined;

interface FacilityRow {
  ID?: number;
  Name?: string;
  Type?: string;              // "accommodation" | "room"
  AccommodationID?: number;
  RoomID?: number;
  Accommodation?: MaybeName;
  Room?: MaybeName;
}

// ---- Helpers ----
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  const tokenType = localStorage.getItem("token_type");
  return {
    "Content-Type": "application/json",
    ...(token && tokenType ? { Authorization: `${tokenType} ${token}` } : {}),
  };
};


const norm = (r: any): FacilityRow => ({
  ID: r.ID ?? r.id,
  Name: r.Name ?? r.name,
  Type: r.Type ?? r.type,
  AccommodationID: r.AccommodationID ?? r.accommodation_id,
  RoomID: r.RoomID ?? r.room_id,
  Accommodation: r.Accommodation ?? r.accommodation,
  Room: r.Room ?? r.room,
});

const typeLabel = (t?: string) =>
  t === "accommodation" ? "ที่พัก"
  : t === "room" ? "ห้องพัก"
  : "-";

const relationText = (row: FacilityRow) => {
  const accName = row.Accommodation?.Name || row.Accommodation?.name;
  const roomName = row.Room?.Name || row.Room?.name;

  if (row.Type === "accommodation" || row.AccommodationID || accName) {
    const label = accName || (row.AccommodationID ? `#${row.AccommodationID}` : "-");
    return `ที่พัก: ${label}`;
  }
  if (row.Type === "room" || row.RoomID || roomName) {
    const label = roomName || (row.RoomID ? `#${row.RoomID}` : "-");
    return `ห้อง: ${label}`;
  }
  return "-";
};

// ---- API calls (ภายในไฟล์) ----
const fetchFacilities = async () => {
  try {
    const res = await fetch(`${apiUrl}/facility`, { headers: getAuthHeaders() });
    const json = await res.json().catch(() => ({}));
    return { status: res.status, data: json?.data ?? json };
  } catch {
    return { status: 500, data: null };
  }
};

const deleteFacilityById = async (id: string) => {
  try {
    const res = await fetch(`${apiUrl}/facility/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    const json = await res.json().catch(() => ({}));
    return { status: res.status, data: json };
  } catch {
    return { status: 500, data: { error: "Network error" } };
  }
};

// ---- Page ----
const Facility: React.FC = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<FacilityRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const myId = localStorage.getItem("id") ?? "";

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetchFacilities();
      if (res.status === 200 && Array.isArray(res.data)) {
        setRows((res.data as any[]).map(norm));
      } else {
        setRows([]);
        messageApi.error("ไม่สามารถดึงข้อมูลสิ่งอำนวยความสะดวกได้");
      }
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id?: number) => {
    if (!id) return;
    const res = await deleteFacilityById(String(id));
    if (res.status === 200) {
      messageApi.success(res.data?.message || "ลบข้อมูลสำเร็จ");
      await load();
    } else {
      messageApi.error(res.data?.error || "ลบข้อมูลไม่สำเร็จ");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const columns: ColumnsType<FacilityRow> = [
    {
      title: "",
      width: 50,
      render: (r) => {
        const isMe = String(r?.ID ?? "") === myId;
        if (isMe) return null;
        return (
          <Popconfirm
            title="ยืนยันการลบ?"
            okText="ลบ"
            cancelText="ยกเลิก"
            onConfirm={() => onDelete(r.ID)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        );
      },
    },
    { title: "ID", dataIndex: "ID", key: "ID", width: 80, sorter: (a, b) => (a.ID || 0) - (b.ID || 0) },
    { title: "ชื่อ", dataIndex: "Name", key: "Name" },
    {
      title: "ประเภท",
      dataIndex: "Type",
      key: "Type",
      width: 140,
      render: (v) => typeLabel(v),
    },
    {
      title: "เชื่อมโยงกับ",
      key: "relation",
      width: 260,
      render: (r) => relationText(r),
    },
    {
      title: "การจัดการ",
      key: "action",
      width: 120,
      render: (r) => (
        <Button
          type="primary"
          size="small"
          icon={<EditOutlined />}
          onClick={() => navigate(`/accommodation/facility/edit/${r.ID}`)}
        >
          แก้ไข
        </Button>
      ),
    },
  ];

  return (
    <>
      {contextHolder}

      <Row gutter={[16, 16]} align="middle">
        <Col flex="auto">
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>
            จัดการข้อมูลสิ่งอำนวยความสะดวก
          </h2>
        </Col>
        <Col>
          <Link to="/accommodation/facility/create">
            <Button type="primary" icon={<PlusOutlined />} size="large">
              เพิ่มสิ่งอำนวยความสะดวก
            </Button>
          </Link>
        </Col>
      </Row>

      <Divider style={{ margin: "16px 0" }} />

      <div
        style={{
          background: "#fff",
          padding: 24,
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <Table<FacilityRow>
          rowKey={(r) => String(r.ID ?? Math.random())}
          loading={loading}
          columns={columns}
          dataSource={rows}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} จาก ${total} รายการ`,
          }}
          scroll={{ x: 900 }}
          size="middle"
        />
      </div>
    </>
  );
};

export default Facility;

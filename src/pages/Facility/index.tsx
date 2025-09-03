import React, { useState, useEffect } from "react";
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

// Admin Interface
interface FacilityInterface {
  ID?: number;
  Name?: string;
  Type?: string;
  BedType?: string;
  People?:  number;
  Price?:   number;
  Status?:  string;
  AccommodationID?:  number;
}

// API Functions
const apiUrl = "http://localhost:8000";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  const tokenType = localStorage.getItem("token_type");
  return {
    "Content-Type": "application/json",
    ...(token && tokenType ? { Authorization: `${tokenType} ${token}` } : {}),
  };
};

const fetchRooms = async () => {
  try {
    const response = await fetch(`${apiUrl}/admin`, {
      headers: getAuthHeaders(),
    });
    if (response.ok) {
      const data = await response.json();
      return { status: response.status, data: data.data || data };
    }
    return { status: response.status, data: null };
  } catch (error) {
    console.error("Fetch error:", error);
    return { status: 500, data: null };
  }
};

const deleteAdminById = async (id: string) => {
  try {
    const response = await fetch(`${apiUrl}/admin/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error("Delete error:", error);
    return { status: 500, data: { error: "Network error" } };
  }
};

const Facility: React.FC = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<FacilityInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [messageApi, contextHolder] = message.useMessage();

  const myId = localStorage.getItem("id") ?? "";

  const handleDelete = async (id: string | number) => {
    try {
      setLoading(true);
      const res = await deleteAdminById(String(id));
      if (res.status === 200) {
        messageApi.success(res.data?.message || "ลบข้อมูลสำเร็จ");
        await loadRooms();
      } else {
        messageApi.error(res.data?.error || "ลบข้อมูลไม่สำเร็จ");
      }
    } catch (e) {
      console.error("Delete error:", e);
      messageApi.error("เกิดข้อผิดพลาดในการลบข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const loadRooms = async () => {
    try {
      setLoading(true);
      const res = await fetchRooms();
      
      if (res.status === 200 && res.data) {
        if (Array.isArray(res.data)) {
          setRooms(res.data);
        } else {
          setRooms([]);
          messageApi.error("รูปแบบข้อมูลไม่ถูกต้อง");
        }
      } else {
        setRooms([]);
        messageApi.error("ไม่สามารถดึงข้อมูลห้องพักได้");
      }
    } catch (e) {
      console.error("Load error:", e);
      setRooms([]);
      messageApi.error("เกิดข้อผิดพลาดในการดึงข้อมูลห้องพัก");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);


  const columns: ColumnsType<FacilityInterface> = [
    {
      title: "",
      width: 50,
      render: (record) => {
        const isMe = String(record.ID ?? "") === myId;
        if (isMe) return null;
        return (
          <Popconfirm
            title="ยืนยันการลบ?"
            description="คุณต้องการลบรายการนี้หรือไม่"
            okText="ลบ"
            cancelText="ยกเลิก"
            onConfirm={() => handleDelete(record.ID as number)}
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              size="small"
            />
          </Popconfirm>
        );
      },
    },
    {
      title: "ID",
      dataIndex: "ID",
      key: "ID",
      width: 80,
      sorter: (a, b) => (a.ID || 0) - (b.ID || 0),
    },
    {
      title: "ชื่อ",
      dataIndex: "Name",
      key: "Name",
      sorter: (a, b) => (a.Name || "").localeCompare(b.Name || ""),
    },
    {
      title: "ลักษณะห้อง",
      dataIndex: "Type",
      key: "Type",
      sorter: (a, b) => (a.Type || "").localeCompare(b.Type || ""),
    },
    {
      title: "ลักษณะเตียง",
      dataIndex: "BedType",
      key: "BedType",
      sorter: (a, b) => (a.BedType || "").localeCompare(b.BedType || ""),
    },
        {
      title: "สถานะ",
      dataIndex: "Status",
      key: "Status",
      sorter: (a, b) => (a.Status || "").localeCompare(b.Status || ""),
    },

    {
      title: "การจัดการ",
      key: "action",
      width: 120,
      render: (record) => (
        <Button
          type="primary"
          size="small"
          icon={<EditOutlined />}
          onClick={() => navigate(`/admin/edit/${record.ID}`)}
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
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>
            จัดการข้อมูลผู้ดูแลระบบ
          </h2>
        </Col>
        <Col>
          <Link to="/admin/create">
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              size="large"
            >
              เพิ่มผู้ดูแลระบบ
            </Button>
          </Link>
        </Col>
      </Row>

      <Divider style={{ margin: "16px 0" }} />

      <div style={{ 
        background: '#fff', 
        padding: '24px', 
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <Table<FacilityInterface>
          rowKey={(record) => String(record.ID ?? Math.random())}
          loading={loading}
          columns={columns}
          dataSource={rooms}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} จาก ${total} รายการ`,
          }}
          scroll={{ x: 800 }}
          size="middle"
        />
      </div>
    </>
  );
};

export default Facility;
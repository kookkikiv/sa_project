// src/pages/Room/index.tsx
import { useState, useEffect } from "react";
import {
  Space,
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

import { GetRoom, DeleteRoomById } from "../../services/https";
import { type RoomInterface } from "../../interface/Room";

// ---------- helpers ----------
type RowWithNames = RoomInterface & {
  accommodationName?: string;
};

const asArray = <T,>(val: any): T[] =>
  Array.isArray(val) ? (val as T[])
  : Array.isArray(val?.data) ? (val.data as T[])
  : Array.isArray(val?.items) ? (val.items as T[])
  : [];

// ดึงชื่อที่พักจากหลายคีย์ที่อาจส่งมา
const getAccName = (r: any) =>
  r?.Accommodation?.Name ??
  r?.Accommodation?.name ??
  r?.accommodation?.Name ??
  r?.accommodation?.name ??
  "";

// ปรับคีย์ให้สม่ำเสมอ (กัน backend ส่งชื่อคีย์ไม่ตรง)
const normalizeRoom = (r: any) => {
  const Name    = r.Name    ?? r.name    ?? "";
  const Type    = r.Type    ?? r.type    ?? "";
  const BedType = r.BedType ?? r.bed_type ?? "";
  const Status  = r.Status  ?? r.status  ?? "";
  const People  = Number(r.People ?? r.people ?? 0);
  const Price   = Number(r.Price  ?? r.price  ?? 0);

  return {
    ...r,
    Name, Type, BedType, Status, People, Price,
    accommodationName: getAccName(r),
  } as RowWithNames;
};

function Room() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<RowWithNames[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [messageApi, contextHolder] = message.useMessage();

  const myId = localStorage.getItem("id") ?? "";

  const getRooms = async () => {
    try {
      setLoading(true);
      const res = await GetRoom();
      if (res.status !== 200) throw new Error(res.data?.error ?? "ไม่สามารถดึงข้อมูลห้องพักได้");
      const raw = asArray<RoomInterface>(res.data);
      setRows(raw.map(normalizeRoom));
    } catch (e: any) {
      setRows([]);
      messageApi.error(e?.message || "เกิดข้อผิดพลาดในการดึงข้อมูลห้องพัก");
    } finally {
      setLoading(false);
    }
  };

  const deleteRoom = async (id: string | number) => {
    try {
      const res = await DeleteRoomById(String(id));
      if (res.status === 200) {
        messageApi.success(res.data?.message ?? "ลบข้อมูลสำเร็จ");
        await getRooms();
      } else {
        messageApi.error(res.data?.error ?? "ลบข้อมูลไม่สำเร็จ");
      }
    } catch {
      messageApi.error("เกิดข้อผิดพลาดในการลบข้อมูล");
    }
  };

  useEffect(() => {
    void getRooms();
  }, []);

  const columns: ColumnsType<RowWithNames> = [
    {
      title: "",
      width: 72,
      render: (record) => {
        const isMe = String(record?.ID ?? "") === myId;
        if (isMe) return null;
        return (
          <Popconfirm
            title="ยืนยันการลบ?"
            description="คุณต้องการลบรายการนี้หรือไม่"
            okText="ลบ"
            cancelText="ยกเลิก"
            onConfirm={() => deleteRoom(record.ID as any)}
          >
            <Button type="dashed" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        );
      },
    },
    { title: "ID", dataIndex: "ID", key: "ID", width: 80 },
    { title: "ชื่อ", dataIndex: "Name", key: "Name" },
    { title: "ลักษณะห้อง", dataIndex: "Type", key: "Type", width: 160 },
    { title: "ลักษณะเตียง", dataIndex: "BedType", key: "BedType", width: 160 },
    { title: "จำนวนคน", dataIndex: "People", key: "People", width: 120 },
    { title: "ราคา", dataIndex: "Price", key: "Price", width: 120 },
    { title: "สถานะ", dataIndex: "Status", key: "Status", width: 120 },
    { title: "ที่พัก", dataIndex: "accommodationName", key: "accommodationName", width: 220 },
    {
      title: "",
      width: 140,
      render: (record) => (
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => navigate(`/accommodation/room/edit/${record.ID}`)}
        >
          แก้ไข
        </Button>
      ),
    },
  ];

  return (
    <>
      {contextHolder}

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <h2 style={{ margin: 0 }}>จัดการข้อมูลห้องพัก</h2>
        </Col>
        <Col span={12} style={{ textAlign: "end", alignSelf: "center" }}>
          <Space>
            <Link to="/accommodation/room/create">
              <Button type="primary" icon={<PlusOutlined />}>
                เพิ่มห้องพัก
              </Button>
            </Link>
          </Space>
        </Col>
      </Row>

      <Divider style={{ margin: "12px 0 16px" }} />

      <div style={{ marginTop: 12 }}>
        <Table<RowWithNames>
          rowKey={(r) => String((r as any).ID ?? "")}
          loading={loading}
          columns={columns}
          dataSource={Array.isArray(rows) ? rows : []}
          style={{ width: "100%", overflow: "auto" }}
          pagination={{ pageSize: 10, showSizeChanger: false }}
        />
      </div>
    </>
  );
}

export default Room;

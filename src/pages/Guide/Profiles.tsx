import React, { useState } from "react";
import {
  Table, Button, Space, Modal, Form, Input, Select,
  Popconfirm, message, Tag, Row, Col, Tabs, Rate
} from "antd";

const { Option } = Select;
const { Search } = Input;

interface GuideProfile {
  id: number;
  name: string;
  age: number;
  sex: string;
  phone: string;
  email: string;
  guideType: string;
  languages: string[];
  serviceAreas: string[];
  status: string; // Active / Suspended
  documentsPath?: string;
}

interface GuideReview {
  id: number;
  guideId: number;
  member: string;
  rating: number;
  comment: string;
  date: string;
}

const Profiles: React.FC = () => {
  const [data, setData] = useState<GuideProfile[]>([
    {
      id: 5001,
      name: "สมชาย ใจดี",
      age: 28,
      sex: "ชาย",
      phone: "0888888888",
      email: "guide01@gmail.com",
      guideType: "Local Guide",
      languages: ["อังกฤษ", "จีน"],
      serviceAreas: ["กรุงเทพฯ", "อยุธยา"],
      status: "Active",
      documentsPath: "/files/guide5001.pdf",
    },
    {
      id: 5002,
      name: "สมหญิง สายบุญ",
      age: 32,
      sex: "หญิง",
      phone: "0777777777",
      email: "guide02@gmail.com",
      guideType: "General Guide",
      languages: ["ญี่ปุ่น"],
      serviceAreas: ["เชียงใหม่"],
      status: "Suspended",
    },
  ]);

  const [reviews] = useState<GuideReview[]>([
    {
      id: 1,
      guideId: 5001,
      member: "John Doe",
      rating: 5,
      comment: "ไกด์เก่งมาก พูดอังกฤษชัดเจน",
      date: "2025-08-20",
    },
    {
      id: 2,
      guideId: 5001,
      member: "Jane Smith",
      rating: 4,
      comment: "พาเที่ยวดี แต่ควรเพิ่มความรู้ด้านประวัติศาสตร์",
      date: "2025-08-22",
    },
    {
      id: 3,
      guideId: 5002,
      member: "Alex Kim",
      rating: 3,
      comment: "บริการโอเค แต่พูดจีนยังไม่คล่อง",
      date: "2025-08-25",
    },
  ]);

  const [filteredData, setFilteredData] = useState<GuideProfile[]>(data);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<GuideProfile | null>(null);
  const [form] = Form.useForm();

  // -----------------------------
  // CRUD Functions
  // -----------------------------
  const handleEdit = (record: GuideProfile) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      setData((prev) =>
        prev.map((item) =>
          item.id === editingRecord?.id ? { ...item, ...values } : item
        )
      );
      setFilteredData((prev) =>
        prev.map((item) =>
          item.id === editingRecord?.id ? { ...item, ...values } : item
        )
      );
      message.success("บันทึกการแก้ไขเรียบร้อยแล้ว");
      setIsModalOpen(false);
    });
  };

  const handleDelete = (id: number) => {
    setData((prev) => prev.filter((item) => item.id !== id));
    setFilteredData((prev) => prev.filter((item) => item.id !== id));
    message.success("ลบโปรไฟล์เรียบร้อยแล้ว");
  };

  const handleToggleStatus = (id: number) => {
    setData((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: item.status === "Active" ? "Suspended" : "Active" }
          : item
      )
    );
    setFilteredData((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: item.status === "Active" ? "Suspended" : "Active" }
          : item
      )
    );
    message.success("เปลี่ยนสถานะเรียบร้อยแล้ว");
  };

  // -----------------------------
  // Table Columns
  // -----------------------------
  const columns = [
    { title: "รหัส", dataIndex: "id", key: "id" },
    { title: "ชื่อ-นามสกุล", dataIndex: "name", key: "name" },
    { title: "ประเภทไกด์", dataIndex: "guideType", key: "guideType" },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "Active" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "การจัดการ",
      key: "action",
      render: (_: any, record: GuideProfile) => (
        <Space>
          <Button onClick={() => handleEdit(record)}>รายละเอียด</Button>
          <Button onClick={() => handleToggleStatus(record.id)}>
            {record.status === "Active" ? "ระงับ" : "เปิดใช้งาน"}
          </Button>
          <Popconfirm
            title="ยืนยันการลบโปรไฟล์นี้?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger>ลบ</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // -----------------------------
  // Modal (Detail + Reviews)
  // -----------------------------
  const renderModalContent = () => {
    if (!editingRecord) return null;

    // รีวิวเฉพาะไกด์คนนั้น
    const guideReviews = reviews.filter(r => r.guideId === editingRecord.id);

    return (
      <Tabs
        defaultActiveKey="1"
        items={[
          {
            key: "1",
            label: "ข้อมูลส่วนตัว",
            children: (
              <>
                <p><b>ชื่อ:</b> {editingRecord.name}</p>
                <p><b>อีเมล:</b> {editingRecord.email}</p>
                <p><b>เบอร์โทร:</b> {editingRecord.phone}</p>
                <p><b>ภาษา:</b> {editingRecord.languages.join(", ")}</p>
                <p><b>พื้นที่บริการ:</b> {editingRecord.serviceAreas.join(", ")}</p>
                <p><b>ประเภทไกด์:</b> {editingRecord.guideType}</p>
                <p><b>สถานะ:</b> {editingRecord.status}</p>
              </>
            ),
          },
          {
            key: "2",
            label: "รีวิว",
            children: (
              <>
                {guideReviews.length > 0 ? (
                  guideReviews.map((review) => (
                    <div
                      key={review.id}
                      style={{
                        borderBottom: "1px solid #f0f0f0",
                        padding: "10px 0",
                      }}
                    >
                      <p><b>{review.member}</b> ({review.date})</p>
                      <Rate disabled defaultValue={review.rating} />
                      <p>{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <p>ยังไม่มีรีวิวสำหรับไกด์คนนี้</p>
                )}
              </>
            ),
          },
        ]}
      />
    );
  };

  return (
    <div>
      <h1>โปรไฟล์ไกด์</h1>

      {/* Search */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Search
            placeholder="ค้นหาจากชื่อ, เบอร์โทร, อีเมล"
            onSearch={(value) =>
              setFilteredData(
                data.filter(
                  (item) =>
                    item.name.includes(value) ||
                    item.email.includes(value) ||
                    item.phone.includes(value)
                )
              )
            }
            allowClear
          />
        </Col>
      </Row>

      {/* Table */}
      <Table dataSource={filteredData} columns={columns} rowKey="id" />

      {/* Modal รายละเอียด + รีวิว */}
      <Modal
        title="รายละเอียดโปรไฟล์ไกด์"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={800}
      >
        {renderModalContent()}
      </Modal>
    </div>
  );
};

export default Profiles;

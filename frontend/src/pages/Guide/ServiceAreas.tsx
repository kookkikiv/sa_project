import React, { useState } from "react";
import {
  Table, Button, Space, Modal, Form, Input, Popconfirm, message,
  Row, Col
} from "antd";

const { Search } = Input;

interface GuideArea {
  id: number;
  name: string;       // ชื่อพื้นที่
  region: string;     // ภูมิภาค เช่น เหนือ, ใต้, อีสาน
}

const GuideAreas: React.FC = () => {
  const [data, setData] = useState<GuideArea[]>([
    { id: 1, name: "กรุงเทพมหานคร", region: "กลาง" },
    { id: 2, name: "เชียงใหม่", region: "เหนือ" },
    { id: 3, name: "ภูเก็ต", region: "ใต้" },
  ]);

  const [filteredData, setFilteredData] = useState<GuideArea[]>(data);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<GuideArea | null>(null);
  const [form] = Form.useForm();

  // -----------------------------
  // CRUD Functions
  // -----------------------------
  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: GuideArea) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      if (editingRecord) {
        // update
        setData((prev) =>
          prev.map((item) =>
            item.id === editingRecord.id ? { ...item, ...values } : item
          )
        );
        setFilteredData((prev) =>
          prev.map((item) =>
            item.id === editingRecord.id ? { ...item, ...values } : item
          )
        );
        message.success("แก้ไขพื้นที่เรียบร้อยแล้ว");
      } else {
        // add new
        const newItem: GuideArea = {
          id: Date.now(),
          ...values,
        };
        setData((prev) => [...prev, newItem]);
        setFilteredData((prev) => [...prev, newItem]);
        message.success("เพิ่มพื้นที่เรียบร้อยแล้ว");
      }
      setIsModalOpen(false);
    });
  };

  const handleDelete = (id: number) => {
    setData((prev) => prev.filter((item) => item.id !== id));
    setFilteredData((prev) => prev.filter((item) => item.id !== id));
    message.success("ลบพื้นที่เรียบร้อยแล้ว");
  };

  // -----------------------------
  // Table Columns
  // -----------------------------
  const columns = [
    { title: "รหัส", dataIndex: "id", key: "id" },
    { title: "ชื่อพื้นที่", dataIndex: "name", key: "name" },
    { title: "ภูมิภาค", dataIndex: "region", key: "region" },
    {
      title: "การจัดการ",
      key: "action",
      render: (_: any, record: GuideArea) => (
        <Space>
          <Button onClick={() => handleEdit(record)}>แก้ไข</Button>
          <Popconfirm
            title="ยืนยันการลบพื้นที่นี้?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger>ลบ</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h1>จัดการพื้นที่บริการไกด์</h1>

      {/* Search + Add */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Search
            placeholder="ค้นหาจากชื่อพื้นที่"
            onSearch={(value) =>
              setFilteredData(data.filter((item) => item.name.includes(value)))
            }
            allowClear
          />
        </Col>
        <Col span={12} style={{ textAlign: "right" }}>
          <Button type="primary" onClick={handleAdd}>เพิ่มพื้นที่</Button>
        </Col>
      </Row>

      {/* Table */}
      <Table dataSource={filteredData} columns={columns} rowKey="id" />

      {/* Modal เพิ่ม/แก้ไข */}
      <Modal
        title={editingRecord ? "แก้ไขพื้นที่บริการ" : "เพิ่มพื้นที่บริการ"}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
        okText="บันทึก"
        cancelText="ยกเลิก"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="ชื่อพื้นที่" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="region" label="ภูมิภาค" rules={[{ required: true }]}>
            <Input placeholder="เช่น เหนือ / ใต้ / อีสาน / กลาง" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GuideAreas;

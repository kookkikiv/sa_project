import React, { useState } from "react";
import {
  Table, Button, Space, Modal, Form, Input, Popconfirm, message,
  Row, Col
} from "antd";

const { Search } = Input;

interface GuideType {
  id: number;
  name: string;
  description: string;
}

const GuideTypes: React.FC = () => {
  const [data, setData] = useState<GuideType[]>([
    { id: 1, name: "Local Guide", description: "ไกด์ท้องถิ่น ผู้เชี่ยวชาญพื้นที่" },
    { id: 2, name: "General Guide", description: "ไกด์ทั่วไป สามารถพานักท่องเที่ยวได้หลายพื้นที่" },
  ]);

  const [filteredData, setFilteredData] = useState<GuideType[]>(data);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<GuideType | null>(null);
  const [form] = Form.useForm();

  // -----------------------------
  // CRUD Functions
  // -----------------------------
  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: GuideType) => {
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
        message.success("แก้ไขประเภทไกด์เรียบร้อยแล้ว");
      } else {
        // add new
        const newItem: GuideType = {
          id: Date.now(),
          ...values,
        };
        setData((prev) => [...prev, newItem]);
        setFilteredData((prev) => [...prev, newItem]);
        message.success("เพิ่มประเภทไกด์ใหม่เรียบร้อยแล้ว");
      }
      setIsModalOpen(false);
    });
  };

  const handleDelete = (id: number) => {
    setData((prev) => prev.filter((item) => item.id !== id));
    setFilteredData((prev) => prev.filter((item) => item.id !== id));
    message.success("ลบประเภทไกด์เรียบร้อยแล้ว");
  };

  // -----------------------------
  // Table Columns
  // -----------------------------
  const columns = [
    { title: "รหัส", dataIndex: "id", key: "id" },
    { title: "ชื่อประเภท", dataIndex: "name", key: "name" },
    { title: "รายละเอียด", dataIndex: "description", key: "description" },
    {
      title: "การจัดการ",
      key: "action",
      render: (_: any, record: GuideType) => (
        <Space>
          <Button onClick={() => handleEdit(record)}>แก้ไข</Button>
          <Popconfirm
            title="ยืนยันการลบประเภทนี้?"
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
      <h1>จัดการประเภทไกด์</h1>

      {/* Search + Add */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Search
            placeholder="ค้นหาจากชื่อประเภท"
            onSearch={(value) =>
              setFilteredData(data.filter((item) => item.name.includes(value)))
            }
            allowClear
          />
        </Col>
        <Col span={12} style={{ textAlign: "right" }}>
          <Button type="primary" onClick={handleAdd}>เพิ่มประเภทไกด์</Button>
        </Col>
      </Row>

      {/* Table */}
      <Table dataSource={filteredData} columns={columns} rowKey="id" />

      {/* Modal เพิ่ม/แก้ไข */}
      <Modal
        title={editingRecord ? "แก้ไขประเภทไกด์" : "เพิ่มประเภทไกด์"}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
        okText="บันทึก"
        cancelText="ยกเลิก"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="ชื่อประเภท" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="รายละเอียด">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GuideTypes;

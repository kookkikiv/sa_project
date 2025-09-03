import React, { useState } from "react";
import {
  Table, Button, Space, Modal, Form, Input, Popconfirm, message,
  Row, Col
} from "antd";

const { Search } = Input;

interface GuideLanguage {
  id: number;
  name: string;       // ชื่อภาษา
  code: string;       // รหัส (เช่น EN, TH, JP)
}

const GuideLanguages: React.FC = () => {
  const [data, setData] = useState<GuideLanguage[]>([
    { id: 1, name: "ไทย", code: "TH" },
    { id: 2, name: "อังกฤษ", code: "EN" },
    { id: 3, name: "จีน", code: "ZH" },
  ]);

  const [filteredData, setFilteredData] = useState<GuideLanguage[]>(data);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<GuideLanguage | null>(null);
  const [form] = Form.useForm();

  // -----------------------------
  // CRUD Functions
  // -----------------------------
  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: GuideLanguage) => {
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
        message.success("แก้ไขภาษาสำเร็จ");
      } else {
        // add new
        const newItem: GuideLanguage = {
          id: Date.now(),
          ...values,
        };
        setData((prev) => [...prev, newItem]);
        setFilteredData((prev) => [...prev, newItem]);
        message.success("เพิ่มภาษาสำเร็จ");
      }
      setIsModalOpen(false);
    });
  };

  const handleDelete = (id: number) => {
    setData((prev) => prev.filter((item) => item.id !== id));
    setFilteredData((prev) => prev.filter((item) => item.id !== id));
    message.success("ลบภาษาสำเร็จ");
  };

  // -----------------------------
  // Table Columns
  // -----------------------------
  const columns = [
    { title: "รหัส", dataIndex: "id", key: "id" },
    { title: "ชื่อภาษา", dataIndex: "name", key: "name" },
    { title: "รหัสภาษา", dataIndex: "code", key: "code" },
    {
      title: "การจัดการ",
      key: "action",
      render: (_: any, record: GuideLanguage) => (
        <Space>
          <Button onClick={() => handleEdit(record)}>แก้ไข</Button>
          <Popconfirm
            title="ยืนยันการลบภาษา?"
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
      <h1>จัดการภาษาไกด์</h1>

      {/* Search + Add */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Search
            placeholder="ค้นหาจากชื่อภาษา"
            onSearch={(value) =>
              setFilteredData(data.filter((item) => item.name.includes(value)))
            }
            allowClear
          />
        </Col>
        <Col span={12} style={{ textAlign: "right" }}>
          <Button type="primary" onClick={handleAdd}>เพิ่มภาษา</Button>
        </Col>
      </Row>

      {/* Table */}
      <Table dataSource={filteredData} columns={columns} rowKey="id" />

      {/* Modal เพิ่ม/แก้ไข */}
      <Modal
        title={editingRecord ? "แก้ไขภาษา" : "เพิ่มภาษา"}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
        okText="บันทึก"
        cancelText="ยกเลิก"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="ชื่อภาษา" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="code" label="รหัสภาษา" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GuideLanguages;

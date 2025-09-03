import React, { useState } from "react";
import {
  Table, Button, Modal, Form, Select, Tag, message,
  Row, Col, Input, Space, Popconfirm
} from "antd";
import dayjs from "dayjs";

const { Option } = Select;
const { Search } = Input;

interface Guide {
  id: number;
  name: string;
  status: string;
  languages: string[];
  areas: string[];
  unavailableDates: string[]; // yyyy-MM-dd
}

interface Package {
  id: number;
  name: string;
  date: string;
  price: number;
  type: string;
  requiredLanguages: string[];
  requiredAreas: string[];
  guideId?: number;
  guideName?: string;
}

const Mapping: React.FC = () => {
  // Mock Guides
  const [guides] = useState<Guide[]>([
    {
      id: 1,
      name: "สมชาย ใจดี",
      status: "Active",
      languages: ["อังกฤษ", "จีน"],
      areas: ["อยุธยา"],
      unavailableDates: ["2025-09-10"]
    },
    {
      id: 2,
      name: "สมหญิง สายบุญ",
      status: "Suspended",
      languages: ["ญี่ปุ่น"],
      areas: ["เชียงใหม่"],
      unavailableDates: []
    },
    {
      id: 3,
      name: "สมปอง อาสา",
      status: "Active",
      languages: ["ญี่ปุ่น"],
      areas: ["เชียงใหม่"],
      unavailableDates: ["2025-09-20"]
    },
  ]);

  // Mock Packages
  const [packages, setPackages] = useState<Package[]>([
    {
      id: 101,
      name: "ทัวร์อยุธยา 1 วัน",
      date: "2025-09-10",
      price: 1200,
      type: "Day Trip",
      requiredLanguages: ["จีน"],
      requiredAreas: ["อยุธยา"]
    },
    {
      id: 102,
      name: "เชียงใหม่ 3 วัน 2 คืน",
      date: "2025-09-20",
      price: 4500,
      type: "Overnight",
      requiredLanguages: ["ญี่ปุ่น"],
      requiredAreas: ["เชียงใหม่"]
    },
  ]);

  const [filteredData, setFilteredData] = useState<Package[]>(packages);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // -----------------------------
  // ฟิลเตอร์ไกด์ที่เข้าเงื่อนไข
  // -----------------------------
  const getEligibleGuides = (pkg: Package | null) => {
    if (!pkg) return [];

    return guides.filter((g) => {
      if (g.status !== "Active") return false;

      // ภาษา
      const langOk = pkg.requiredLanguages.every((lang) =>
        g.languages.includes(lang)
      );
      if (!langOk) return false;

      // พื้นที่
      const areaOk = pkg.requiredAreas.every((area) =>
        g.areas.includes(area)
      );
      if (!areaOk) return false;

      // วันว่าง
      const dateConflict = g.unavailableDates.some(
        (d) => dayjs(d).format("YYYY-MM-DD") === dayjs(pkg.date).format("YYYY-MM-DD")
      );
      if (dateConflict) return false;

      return true;
    });
  };

  // -----------------------------
  // Assign Guide
  // -----------------------------
  const handleAssign = (pkg: Package) => {
    setSelectedPackage(pkg);
    form.resetFields();
    if (pkg.guideId) {
      form.setFieldsValue({ guideId: pkg.guideId });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      const guide = guides.find((g) => g.id === values.guideId);
      if (!guide) return;

      setPackages((prev) =>
        prev.map((p) =>
          p.id === selectedPackage?.id
            ? { ...p, guideId: guide.id, guideName: guide.name }
            : p
        )
      );
      setFilteredData((prev) =>
        prev.map((p) =>
          p.id === selectedPackage?.id
            ? { ...p, guideId: guide.id, guideName: guide.name }
            : p
        )
      );

      message.success(`บันทึกไกด์ ${guide.name} สำหรับแพ็กเกจแล้ว`);
      setIsModalOpen(false);
    });
  };

  const handleRemoveGuide = (pkg: Package) => {
    setPackages((prev) =>
      prev.map((p) =>
        p.id === pkg.id ? { ...p, guideId: undefined, guideName: undefined } : p
      )
    );
    setFilteredData((prev) =>
      prev.map((p) =>
        p.id === pkg.id ? { ...p, guideId: undefined, guideName: undefined } : p
      )
    );
    message.success(`ยกเลิกการเชื่อมโยงไกด์จากแพ็กเกจ ${pkg.name}`);
  };

  // -----------------------------
  // Filtering
  // -----------------------------
  const handleSearch = (value: string) => {
    setFilteredData(
      packages.filter((p) => p.name.toLowerCase().includes(value.toLowerCase()))
    );
  };

  // -----------------------------
  // Table Columns
  // -----------------------------
  const columns = [
    { title: "ชื่อแพ็กเกจ", dataIndex: "name", key: "name" },
    { title: "วันที่", dataIndex: "date", key: "date" },
    { title: "ประเภท", dataIndex: "type", key: "type" },
    {
      title: "ไกด์ที่กำหนด",
      dataIndex: "guideName",
      key: "guideName",
      render: (val: string) =>
        val ? <Tag color="green">{val}</Tag> : <Tag color="red">ยังไม่กำหนด</Tag>,
    },
    {
      title: "การจัดการ",
      key: "action",
      render: (_: any, record: Package) => (
        <Space>
          <Button type="primary" onClick={() => handleAssign(record)}>
            {record.guideId ? "แก้ไขไกด์" : "เลือกไกด์"}
          </Button>
          {record.guideId && (
            <Popconfirm
              title="ยืนยันการยกเลิกไกด์?"
              onConfirm={() => handleRemoveGuide(record)}
            >
              <Button danger>ลบไกด์</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h1>เชื่อมโยงไกด์กับแพ็กเกจ (1:1)</h1>

      {/* Search */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Search
            placeholder="ค้นหาจากชื่อแพ็กเกจ"
            onSearch={handleSearch}
            allowClear
          />
        </Col>
      </Row>

      {/* Table */}
      <Table dataSource={filteredData} columns={columns} rowKey="id" />

      {/* Modal เลือก/แก้ไขไกด์ */}
      <Modal
        title={`เลือกไกด์สำหรับแพ็กเกจ: ${selectedPackage?.name}`}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
        okText="บันทึก"
        cancelText="ยกเลิก"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="guideId"
            label="ไกด์"
            rules={[{ required: true, message: "กรุณาเลือกไกด์" }]}
          >
            <Select placeholder="เลือกไกด์ที่ตรงตามเงื่อนไข">
              {getEligibleGuides(selectedPackage).map((g) => (
                <Option key={g.id} value={g.id}>
                  {g.name} (ภาษา: {g.languages.join(", ")} / พื้นที่:{" "}
                  {g.areas.join(", ")})
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Mapping;

import React, { useState } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
  message,
  Row,
  Col,
  DatePicker,
} from "antd";
import * as XLSX from "xlsx";
import dayjs from "dayjs";

const { Option } = Select;
const { Search } = Input;
const { RangePicker } = DatePicker;

interface Application {
  id: number;
  name: string;
  age: number;
  sex: string;
  phone: string;
  email: string;
  language: string;
  area: string;
  status: string;
  documentsPath?: string;
  rejectionReason?: string;
  applicationDate: string; // ✅ วันที่สมัคร
}

const Applications: React.FC = () => {
  const [data, setData] = useState<Application[]>([
    {
      id: 4001,
      name: "สมหมาย ใจดี",
      age: 25,
      sex: "ชาย",
      phone: "0999999999",
      email: "demo@gmail.com",
      language: "อังกฤษ",
      area: "กรุงเทพฯ",
      status: "รอดำเนินการ",
      documentsPath: "/files/guide4001.pdf",
      applicationDate: "2025-09-02", // วันนี้
    },
    {
      id: 4002,
      name: "สมหญิง สายดี",
      age: 29,
      sex: "หญิง",
      phone: "0888888888",
      email: "demo2@gmail.com",
      language: "จีน",
      area: "เชียงใหม่",
      status: "ผ่าน",
      documentsPath: "/files/guide4002.png",
      applicationDate: "2025-09-01",
    },
    {
      id: 4003,
      name: "สมชาย เก่งงาน",
      age: 32,
      sex: "ชาย",
      phone: "0777777777",
      email: "demo3@gmail.com",
      language: "ญี่ปุ่น",
      area: "ภูเก็ต",
      status: "ไม่ผ่าน",
      rejectionReason: "ไฟล์เอกสารไม่ครบถ้วน",
      documentsPath: "",
      applicationDate: "2025-08-31",
    },
  ]);

  const [filteredData, setFilteredData] = useState<Application[]>(data);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Application | null>(null);
  const [form] = Form.useForm();

  // ✅ Modal Preview เอกสาร
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewPath, setPreviewPath] = useState<string | null>(null);

  const openPreview = (path: string) => {
    setPreviewPath(path);
    setPreviewOpen(true);
  };

  // ✅ Modal ปฏิเสธพร้อมเหตุผล
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingId, setRejectingId] = useState<number | null>(null);

  const handleRejectClick = (id: number) => {
    setRejectingId(id);
    setRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (!rejectReason) {
      message.error("กรุณากรอกเหตุผลก่อน");
      return;
    }
    setData((prev) =>
      prev.map((item) =>
        item.id === rejectingId
          ? { ...item, status: "ไม่ผ่าน", rejectionReason: rejectReason }
          : item
      )
    );
    setFilteredData((prev) =>
      prev.map((item) =>
        item.id === rejectingId
          ? { ...item, status: "ไม่ผ่าน", rejectionReason: rejectReason }
          : item
      )
    );
    message.warning("ปฏิเสธเรียบร้อย พร้อมบันทึกเหตุผลแล้ว");
    setRejectReason("");
    setRejectingId(null);
    setRejectModalOpen(false);
  };

  // -----------------------------
  // 🔹 Search + Filter + Date
  // -----------------------------
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ทั้งหมด");
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);

  const handleSearch = (value: string) => {
    setSearchText(value);
    applyFilter(value, statusFilter, dateRange);
  };

  const handleFilterChange = (value: string) => {
    setStatusFilter(value);
    applyFilter(searchText, value, dateRange);
  };

  const handleDateChange = (dates: any) => {
    if (!dates) {
      setDateRange(null);
      applyFilter(searchText, statusFilter, null);
    } else {
      const start = dates[0].format("YYYY-MM-DD");
      const end = dates[1].format("YYYY-MM-DD");
      setDateRange([start, end]);
      applyFilter(searchText, statusFilter, [start, end]);
    }
  };

  const handleTodayFilter = () => {
    const today = dayjs().format("YYYY-MM-DD");
    setDateRange([today, today]);
    applyFilter(searchText, statusFilter, [today, today]);
  };

  const handleClearDate = () => {
    setDateRange(null);
    applyFilter(searchText, statusFilter, null);
  };

  const applyFilter = (
    search: string,
    status: string,
    range: [string, string] | null
  ) => {
    let filtered = data;

    if (search) {
      filtered = filtered.filter(
        (item) =>
          item.name.includes(search) ||
          item.email.includes(search) ||
          item.phone.includes(search)
      );
    }

    if (status && status !== "ทั้งหมด") {
      filtered = filtered.filter((item) => item.status === status);
    }

    if (range) {
      filtered = filtered.filter(
        (item) =>
          item.applicationDate >= range[0] && item.applicationDate <= range[1]
      );
    }

    setFilteredData(filtered);
  };

  // -----------------------------
  // 🔹 Export Excel/CSV
  // -----------------------------
  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Applications");
    XLSX.writeFile(workbook, "applications.xlsx");
  };

  const handleExportCSV = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "applications.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // -----------------------------
  // 🔹 CRUD Functions
  // -----------------------------
  const handleEdit = (record: Application) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    form
      .validateFields()
      .then((values) => {
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
      })
      .catch(() => message.error("กรุณากรอกข้อมูลให้ครบ"));
  };

  const handleDelete = (id: number) => {
    setData((prev) => prev.filter((item) => item.id !== id));
    setFilteredData((prev) => prev.filter((item) => item.id !== id));
    message.success("ลบข้อมูลเรียบร้อยแล้ว");
  };

  const handleApprove = (id: number) => {
    setData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "ผ่าน", rejectionReason: "" } : item
      )
    );
    setFilteredData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "ผ่าน", rejectionReason: "" } : item
      )
    );
    message.success("อนุมัติเรียบร้อย");
  };

  // -----------------------------
  // 🔹 Table Columns
  // -----------------------------
  const columns = [
    { title: "รหัส", dataIndex: "id", key: "id" },
    { title: "ชื่อ-นามสกุล", dataIndex: "name", key: "name" },
    { title: "อายุ", dataIndex: "age", key: "age" },
    { title: "เพศ", dataIndex: "sex", key: "sex" },
    { title: "เบอร์โทร", dataIndex: "phone", key: "phone" },
    { title: "อีเมล", dataIndex: "email", key: "email" },
    { title: "ภาษา", dataIndex: "language", key: "language" },
    { title: "พื้นที่", dataIndex: "area", key: "area" },
    {
      title: "วันที่สมัคร",
      dataIndex: "applicationDate",
      key: "applicationDate",
    },
    {
      title: "เอกสารแนบ",
      dataIndex: "documentsPath",
      key: "documentsPath",
      render: (path: string) =>
        path ? (
          <Button type="link" onClick={() => openPreview(path)}>
            ดูไฟล์
          </Button>
        ) : (
          "-"
        ),
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      render: (status: string, record: Application) => {
        let color =
          status === "ผ่าน" ? "green" : status === "ไม่ผ่าน" ? "red" : "orange";
        return (
          <Space direction="vertical">
            <Tag color={color}>{status}</Tag>
            {status === "ไม่ผ่าน" && record.rejectionReason && (
              <span style={{ color: "red", fontSize: 12 }}>
                เหตุผล: {record.rejectionReason}
              </span>
            )}
          </Space>
        );
      },
    },
    {
      title: "การจัดการ",
      key: "action",
      render: (_: any, record: Application) => (
        <Space>
          <Button type="primary" onClick={() => handleApprove(record.id)}>
            อนุมัติ
          </Button>
          <Button danger onClick={() => handleRejectClick(record.id)}>
            ปฏิเสธ
          </Button>
          <Button onClick={() => handleEdit(record)}>แก้ไข</Button>
          <Popconfirm
            title="ยืนยันการลบ?"
            onConfirm={() => handleDelete(record.id)}
            okText="ใช่"
            cancelText="ไม่"
          >
            <Button danger>ลบ</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h1>จัดการการสมัครไกด์</h1>

      {/* Search + Filter + Date + Export */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={5}>
          <Search
            placeholder="ค้นหาจากชื่อ, เบอร์โทร, อีเมล"
            onSearch={handleSearch}
            allowClear
          />
        </Col>
        <Col span={4}>
          <Select
            defaultValue="ทั้งหมด"
            style={{ width: "100%" }}
            onChange={handleFilterChange}
          >
            <Option value="ทั้งหมด">ทั้งหมด</Option>
            <Option value="รอดำเนินการ">รอดำเนินการ</Option>
            <Option value="ผ่าน">ผ่าน</Option>
            <Option value="ไม่ผ่าน">ไม่ผ่าน</Option>
          </Select>
        </Col>
        <Col span={5}>
          <RangePicker onChange={handleDateChange} />
        </Col>
        <Col span={6} style={{ textAlign: "center" }}>
          <Space>
            <Button onClick={handleTodayFilter}>วันนี้</Button>
            <Button onClick={handleClearDate}>ล้าง</Button>
          </Space>
        </Col>
        <Col span={4} style={{ textAlign: "right" }}>
          <Space>
            <Button onClick={handleExportExcel}>Export Excel</Button>
            <Button onClick={handleExportCSV}>Export CSV</Button>
          </Space>
        </Col>
      </Row>

      {/* Table พร้อม Pagination */}
      <Table
        dataSource={filteredData}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 5 }}
      />

      {/* Modal แก้ไขข้อมูล */}
      <Modal
        title="แก้ไขข้อมูลการสมัครไกด์"
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
        okText="บันทึก"
        cancelText="ยกเลิก"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="ชื่อ-นามสกุล" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="age" label="อายุ" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="sex" label="เพศ" rules={[{ required: true }]}>
            <Select>
              <Option value="ชาย">ชาย</Option>
              <Option value="หญิง">หญิง</Option>
            </Select>
          </Form.Item>
          <Form.Item name="phone" label="เบอร์โทร" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="อีเมล" rules={[{ required: true, type: "email" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="language" label="ภาษา" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="area" label="พื้นที่บริการ" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Preview เอกสาร */}
      <Modal
        title="เอกสารแนบ"
        open={previewOpen}
        onCancel={() => setPreviewOpen(false)}
        footer={null}
        width={800}
      >
        {previewPath?.endsWith(".pdf") ? (
          <iframe
            src={previewPath}
            style={{ width: "100%", height: "600px" }}
            title="PDF Preview"
          />
        ) : (
          <img
            src={previewPath || ""}
            alt="Document"
            style={{ width: "100%" }}
          />
        )}
      </Modal>

      {/* Modal ปฏิเสธ + กรอกเหตุผล */}
      <Modal
        title="กรอกเหตุผลการปฏิเสธ"
        open={rejectModalOpen}
        onOk={handleConfirmReject}
        onCancel={() => setRejectModalOpen(false)}
        okText="บันทึก"
        cancelText="ยกเลิก"
      >
        <Input.TextArea
          rows={4}
          placeholder="กรุณากรอกเหตุผลที่ปฏิเสธ"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default Applications;

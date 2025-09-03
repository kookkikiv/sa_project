import React, { useState } from "react";
import {
  Table, Button, Space, Tag, Modal, Input, Popconfirm, message,
  Row, Col, Select, DatePicker
} from "antd";
import * as XLSX from "xlsx";
import dayjs from "dayjs";
import { useGuideContext } from "../../context/GuideContext"; // ✅ ใช้ Context

const { TextArea } = Input;
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface ProfileRequest {
  requestId: number;
  guideId: number;
  name: string;
  field: string;
  oldValue: string;
  newValue: string;
  status: "รอดำเนินการ" | "ผ่าน" | "ไม่ผ่าน";
  rejectionReason?: string;
  requestedAt: string;
  documents?: string[];
}

const ProfileRequests: React.FC = () => {
  const { updateProfile } = useGuideContext(); // ✅ อัปเดตโปรไฟล์จริงเมื่ออนุมัติ

  const [data, setData] = useState<ProfileRequest[]>([
    {
      requestId: 9001,
      guideId: 5002,
      name: "สมหญิง สายบุญ",
      field: "ภาษา",
      oldValue: "จีน",
      newValue: "ญี่ปุ่น",
      status: "รอดำเนินการ",
      requestedAt: "2025-09-02",
      documents: ["/files/language_cert.pdf"],
    },
    {
      requestId: 9002,
      guideId: 5001,
      name: "สมชาย ใจดี",
      field: "พื้นที่บริการ",
      oldValue: "กรุงเทพฯ",
      newValue: "ภูเก็ต",
      status: "รอดำเนินการ",
      requestedAt: "2025-09-01",
      documents: ["/files/idcard.jpg"],
    },
  ]);

  const [filteredData, setFilteredData] = useState<ProfileRequest[]>(data);

  // state ค้นหา + กรอง
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("ทั้งหมด");
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);

  // modal ปฏิเสธ
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingId, setRejectingId] = useState<number | null>(null);

  // modal preview document
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<string | null>(null);

  // -----------------------------
  // Filtering
  // -----------------------------
  const applyFilter = (
    search: string,
    status: string,
    range: [string, string] | null = dateRange
  ) => {
    let filtered = data;

    if (search) {
      filtered = filtered.filter(
        (item) =>
          item.name.includes(search) ||
          item.guideId.toString().includes(search)
      );
    }

    if (status && status !== "ทั้งหมด") {
      filtered = filtered.filter((item) => item.status === status);
    }

    if (range) {
      filtered = filtered.filter(
        (item) => item.requestedAt >= range[0] && item.requestedAt <= range[1]
      );
    }

    setFilteredData(filtered);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    applyFilter(value, statusFilter);
  };

  const handleFilterChange = (value: string) => {
    setStatusFilter(value);
    applyFilter(searchText, value);
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

  // -----------------------------
  // Export
  // -----------------------------
  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ProfileRequests");
    XLSX.writeFile(workbook, "profile_requests.xlsx");
  };

  const handleExportCSV = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "profile_requests.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // -----------------------------
  // CRUD (Approve / Reject / Delete)
  // -----------------------------
  const handleApprove = (id: number) => {
    const req = data.find((item) => item.requestId === id);
    if (req) {
      // อัปเดตคำขอ
      setData((prev) =>
        prev.map((item) =>
          item.requestId === id ? { ...item, status: "ผ่าน", rejectionReason: "" } : item
        )
      );
      setFilteredData((prev) =>
        prev.map((item) =>
          item.requestId === id ? { ...item, status: "ผ่าน", rejectionReason: "" } : item
        )
      );
      // อัปเดตข้อมูลจริง Profiles ผ่าน Context
      updateProfile(req.guideId, req.field, req.newValue);
      message.success(`อนุมัติแล้ว และอัปเดตโปรไฟล์ของ ${req.name}`);
    }
  };

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
        item.requestId === rejectingId
          ? { ...item, status: "ไม่ผ่าน", rejectionReason: rejectReason }
          : item
      )
    );
    setFilteredData((prev) =>
      prev.map((item) =>
        item.requestId === rejectingId
          ? { ...item, status: "ไม่ผ่าน", rejectionReason: rejectReason }
          : item
      )
    );
    message.warning("ปฏิเสธคำขอแล้ว");
    setRejectReason("");
    setRejectingId(null);
    setRejectModalOpen(false);
  };

  const handleDelete = (id: number) => {
    setData((prev) => prev.filter((item) => item.requestId !== id));
    setFilteredData((prev) => prev.filter((item) => item.requestId !== id));
    message.success("ลบคำขอเรียบร้อยแล้ว");
  };

  // -----------------------------
  // Documents
  // -----------------------------
  const handleViewDocument = (file: string) => {
    setPreviewFile(file);
    setPreviewOpen(true);
  };

  const handleDownloadDocument = (file: string) => {
    const link = document.createElement("a");
    link.href = file;
    link.download = file.split("/").pop() || "document";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // -----------------------------
  // Table Columns
  // -----------------------------
  const columns = [
    { title: "รหัสคำขอ", dataIndex: "requestId", key: "requestId" },
    { title: "รหัสไกด์", dataIndex: "guideId", key: "guideId" },
    { title: "ชื่อไกด์", dataIndex: "name", key: "name" },
    { title: "ฟิลด์ที่แก้ไข", dataIndex: "field", key: "field" },
    {
      title: "รายละเอียดการแก้ไข",
      key: "diff",
      render: (_: any, record: ProfileRequest) => (
        <span>
          {record.oldValue} → <b>{record.newValue}</b>
        </span>
      ),
    },
    {
      title: "เอกสารแนบ",
      key: "documents",
      render: (_: any, record: ProfileRequest) =>
        record.documents && record.documents.length > 0 ? (
          <Space>
            {record.documents.map((doc, idx) => (
              <Space key={idx}>
                <Button onClick={() => handleViewDocument(doc)}>
                  ดูเอกสาร {idx + 1}
                </Button>
                <Button onClick={() => handleDownloadDocument(doc)}>
                  ดาวน์โหลด
                </Button>
              </Space>
            ))}
          </Space>
        ) : (
          <span>-</span>
        ),
    },
    { title: "วันที่ส่งคำขอ", dataIndex: "requestedAt", key: "requestedAt" },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      render: (status: string, record: ProfileRequest) => {
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
      render: (_: any, record: ProfileRequest) => (
        <Space>
          <Button type="primary" onClick={() => handleApprove(record.requestId)}>
            อนุมัติ
          </Button>
          <Button danger onClick={() => handleRejectClick(record.requestId)}>
            ปฏิเสธ
          </Button>
          <Popconfirm
            title="ยืนยันการลบ?"
            onConfirm={() => handleDelete(record.requestId)}
          >
            <Button danger>ลบ</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h1>จัดการคำขอแก้ไขโปรไฟล์ไกด์</h1>

      {/* Search + Filter + Date + Export */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={5}>
          <Search
            placeholder="ค้นหาจากชื่อหรือรหัสไกด์"
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
        <Col span={6}>
          <Space>
            <Button
              onClick={() => {
                const today = dayjs().format("YYYY-MM-DD");
                setDateRange([today, today]);
                applyFilter(searchText, statusFilter, [today, today]);
              }}
            >
              วันนี้
            </Button>
            <Button
              onClick={() => {
                setDateRange(null);
                applyFilter(searchText, statusFilter, null);
              }}
            >
              ล้าง
            </Button>
          </Space>
        </Col>
        <Col span={4} style={{ textAlign: "right" }}>
          <Space>
            <Button onClick={handleExportExcel}>Export Excel</Button>
            <Button onClick={handleExportCSV}>Export CSV</Button>
          </Space>
        </Col>
      </Row>

      {/* Table */}
      <Table dataSource={filteredData} columns={columns} rowKey="requestId" />

      {/* Modal ปฏิเสธ */}
      <Modal
        title="กรอกเหตุผลการปฏิเสธ"
        open={rejectModalOpen}
        onOk={handleConfirmReject}
        onCancel={() => setRejectModalOpen(false)}
        okText="บันทึก"
        cancelText="ยกเลิก"
      >
        <TextArea
          rows={4}
          placeholder="กรุณากรอกเหตุผลที่ปฏิเสธ"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </Modal>

      {/* Modal Preview Document */}
      <Modal
        title="ดูเอกสาร"
        open={previewOpen}
        onCancel={() => setPreviewOpen(false)}
        footer={null}
        width={800}
      >
        {previewFile &&
          (previewFile.endsWith(".pdf") ? (
            <iframe
              src={previewFile}
              style={{ width: "100%", height: "600px" }}
              title="PDF Preview"
            />
          ) : (
            <img src={previewFile} alt="Document" style={{ width: "100%" }} />
          ))}
      </Modal>
    </div>
  );
};

export default ProfileRequests;

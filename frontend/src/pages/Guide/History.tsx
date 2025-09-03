import React, { useState } from "react";
import { Table, Tag, Row, Col, Input, Select, DatePicker } from "antd";
import dayjs from "dayjs";

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface GuideHistory {
  id: number;
  guideId: number;
  name: string;
  action: string;       // การกระทำ เช่น สมัคร, อนุมัติ, ปฏิเสธ, แก้ไขข้อมูล
  status: "รอดำเนินการ" | "ผ่าน" | "ไม่ผ่าน";
  reason?: string;      // เหตุผลถ้าไม่ผ่าน
  date: string;         // วันที่ทำรายการ
}

const GuideHistory: React.FC = () => {
  const [data] = useState<GuideHistory[]>([
    {
      id: 1,
      guideId: 5001,
      name: "สมชาย ใจดี",
      action: "สมัครไกด์",
      status: "ผ่าน",
      date: "2025-08-20",
    },
    {
      id: 2,
      guideId: 5002,
      name: "สมหญิง สายบุญ",
      action: "สมัครไกด์",
      status: "ไม่ผ่าน",
      reason: "เอกสารไม่ครบ",
      date: "2025-08-22",
    },
    {
      id: 3,
      guideId: 5002,
      name: "สมหญิง สายบุญ",
      action: "ส่งคำขอแก้ไขข้อมูล (ภาษา)",
      status: "ผ่าน",
      date: "2025-08-30",
    },
  ]);

  const [filteredData, setFilteredData] = useState<GuideHistory[]>(data);
  const [statusFilter, setStatusFilter] = useState<string>("ทั้งหมด");

  // -----------------------------
  // Filtering
  // -----------------------------
  const handleSearch = (value: string) => {
    setFilteredData(
      data.filter(
        (item) =>
          item.name.includes(value) ||
          item.guideId.toString().includes(value) ||
          item.action.includes(value)
      )
    );
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    if (value === "ทั้งหมด") {
      setFilteredData(data);
    } else {
      setFilteredData(data.filter((item) => item.status === value));
    }
  };

  const handleDateChange = (dates: any) => {
    if (!dates) {
      setFilteredData(data);
      return;
    }
    const start = dates[0].format("YYYY-MM-DD");
    const end = dates[1].format("YYYY-MM-DD");
    setFilteredData(
      data.filter((item) => item.date >= start && item.date <= end)
    );
  };

  // -----------------------------
  // Table Columns
  // -----------------------------
  const columns = [
    { title: "รหัสประวัติ", dataIndex: "id", key: "id" },
    { title: "รหัสไกด์", dataIndex: "guideId", key: "guideId" },
    { title: "ชื่อไกด์", dataIndex: "name", key: "name" },
    { title: "การกระทำ", dataIndex: "action", key: "action" },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      render: (status: string, record: GuideHistory) => {
        let color =
          status === "ผ่าน" ? "green" : status === "ไม่ผ่าน" ? "red" : "orange";
        return (
          <div>
            <Tag color={color}>{status}</Tag>
            {status === "ไม่ผ่าน" && record.reason && (
              <div style={{ color: "red", fontSize: 12 }}>
                เหตุผล: {record.reason}
              </div>
            )}
          </div>
        );
      },
    },
    { title: "วันที่", dataIndex: "date", key: "date" },
  ];

  return (
    <div>
      <h1>ประวัติการสมัครและการแก้ไขข้อมูลไกด์</h1>

      {/* Search + Filter */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Search
            placeholder="ค้นหาจากชื่อไกด์ / รหัสไกด์ / การกระทำ"
            onSearch={handleSearch}
            allowClear
          />
        </Col>
        <Col span={4}>
          <Select
            defaultValue="ทั้งหมด"
            style={{ width: "100%" }}
            onChange={handleStatusChange}
          >
            <Option value="ทั้งหมด">ทั้งหมด</Option>
            <Option value="รอดำเนินการ">รอดำเนินการ</Option>
            <Option value="ผ่าน">ผ่าน</Option>
            <Option value="ไม่ผ่าน">ไม่ผ่าน</Option>
          </Select>
        </Col>
        <Col span={8}>
          <RangePicker
            defaultValue={[dayjs("2025-08-01"), dayjs("2025-09-30")]}
            onChange={handleDateChange}
          />
        </Col>
      </Row>

      {/* Table */}
      <Table dataSource={filteredData} columns={columns} rowKey="id" />
    </div>
  );
};

export default GuideHistory;

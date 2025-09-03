import React, { useState } from "react";
import {
  Table, Tag, Row, Col, Input, Select, DatePicker, Rate
} from "antd";
import dayjs from "dayjs";

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface GuideReview {
  id: number;
  guideId: number;
  guideName: string;
  member: string;    // คนรีวิว
  rating: number;    // คะแนน 1-5
  comment: string;
  date: string;      // วันที่รีวิว
}

const GuideReviews: React.FC = () => {
  const [data] = useState<GuideReview[]>([
    {
      id: 1,
      guideId: 5001,
      guideName: "สมชาย ใจดี",
      member: "John Doe",
      rating: 5,
      comment: "ไกด์น่ารัก พูดอังกฤษคล่อง พาเที่ยวสนุกมาก",
      date: "2025-08-20",
    },
    {
      id: 2,
      guideId: 5002,
      guideName: "สมหญิง สายบุญ",
      member: "Jane Smith",
      rating: 3,
      comment: "บริการโอเค แต่พูดจีนยังไม่ค่อยคล่อง",
      date: "2025-08-22",
    },
    {
      id: 3,
      guideId: 5001,
      guideName: "สมชาย ใจดี",
      member: "Alex Kim",
      rating: 4,
      comment: "ดีครับ แต่ควรเพิ่มความรู้ประวัติศาสตร์",
      date: "2025-08-25",
    },
  ]);

  const [filteredData, setFilteredData] = useState<GuideReview[]>(data);

  // -----------------------------
  // Filtering
  // -----------------------------
  const handleSearch = (value: string) => {
    setFilteredData(
      data.filter(
        (item) =>
          item.guideName.includes(value) ||
          item.guideId.toString().includes(value) ||
          item.member.includes(value)
      )
    );
  };

  const handleRatingFilter = (value: number | "ทั้งหมด") => {
    if (value === "ทั้งหมด") {
      setFilteredData(data);
    } else {
      setFilteredData(data.filter((item) => item.rating === value));
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
    { title: "รหัสรีวิว", dataIndex: "id", key: "id" },
    { title: "รหัสไกด์", dataIndex: "guideId", key: "guideId" },
    { title: "ชื่อไกด์", dataIndex: "guideName", key: "guideName" },
    { title: "ผู้รีวิว", dataIndex: "member", key: "member" },
    {
      title: "คะแนน",
      dataIndex: "rating",
      key: "rating",
      render: (rating: number) => <Rate disabled defaultValue={rating} />,
    },
    { title: "ความคิดเห็น", dataIndex: "comment", key: "comment" },
    {
      title: "วันที่รีวิว",
      dataIndex: "date",
      key: "date",
      render: (date: string) => (
        <Tag color="blue">{dayjs(date).format("YYYY-MM-DD")}</Tag>
      ),
    },
  ];

  return (
    <div>
      <h1>รีวิวไกด์ทั้งหมด</h1>

      {/* Search + Filter */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Search
            placeholder="ค้นหาจากชื่อไกด์ / รหัสไกด์ / ผู้รีวิว"
            onSearch={handleSearch}
            allowClear
          />
        </Col>
        <Col span={4}>
          <Select
            defaultValue="ทั้งหมด"
            style={{ width: "100%" }}
            onChange={handleRatingFilter}
          >
            <Option value="ทั้งหมด">คะแนนทั้งหมด</Option>
            <Option value={5}>⭐ 5 ดาว</Option>
            <Option value={4}>⭐ 4 ดาว</Option>
            <Option value={3}>⭐ 3 ดาว</Option>
            <Option value={2}>⭐ 2 ดาว</Option>
            <Option value={1}>⭐ 1 ดาว</Option>
          </Select>
        </Col>
        <Col span={8}>
          <RangePicker onChange={handleDateChange} />
        </Col>
      </Row>

      {/* Table */}
      <Table dataSource={filteredData} columns={columns} rowKey="id" />
    </div>
  );
};

export default GuideReviews;

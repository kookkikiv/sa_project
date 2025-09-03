import React, { useMemo, useState, useEffect } from "react";
import {
  Row,
  Col,
  Input,
  DatePicker,
  Select,
  Button,
  Card,
  Rate,
  Tag,
  Slider,
  Checkbox,
  Space,
  Divider,
  Typography,
  Pagination,
  Drawer,
  Empty,
} from "antd";
import {
  SearchOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  FilterOutlined,
  StarFilled,
  DollarOutlined,
  HomeOutlined,
  WifiOutlined,
  CarOutlined,
  HeartOutlined,
  HeartTwoTone,
  UpOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

/** ---------------- Mock Data (ตัวอย่าง) ---------------- */
type Hotel = {
  id: number;
  name: string;
  location: string;
  thumbnail: string;
  pricePerNight: number;
  rating: number; // 0..5
  reviews: number;
  facilities: string[]; // 'wifi' | 'parking' | 'pool' | 'breakfast' | ...
  tags?: string[];
};

const HOTELS: Hotel[] = [
  {
    id: 1,
    name: "Riverview Bangkok Hotel",
    location: "กรุงเทพฯ",
    thumbnail:
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1200&auto=format&fit=crop",
    pricePerNight: 1590,
    rating: 4.5,
    reviews: 842,
    facilities: ["wifi", "parking", "pool", "breakfast"],
    tags: ["ยืนหนึ่งทำเลดี", "ใกล้รถไฟฟ้า"],
  },
  {
    id: 2,
    name: "Old Town Boutique",
    location: "เชียงใหม่",
    thumbnail:
      "https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?q=80&w=1200&auto=format&fit=crop",
    pricePerNight: 890,
    rating: 4.2,
    reviews: 311,
    facilities: ["wifi", "breakfast"],
    tags: ["คุ้มค่า"],
  },
  {
    id: 3,
    name: "Blue Reef Resort",
    location: "ภูเก็ต",
    thumbnail:
      "https://images.unsplash.com/photo-1519822471302-3d0b5a3cb0f0?q=80&w=1200&auto=format&fit=crop",
    pricePerNight: 2450,
    rating: 4.8,
    reviews: 1292,
    facilities: ["wifi", "parking", "pool", "beach", "breakfast"],
    tags: ["ยอดนิยม", "ติดทะเล"],
  },
  {
    id: 4,
    name: "City Inn Express",
    location: "กรุงเทพฯ",
    thumbnail:
      "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?q=80&w=1200&auto=format&fit=crop",
    pricePerNight: 690,
    rating: 3.9,
    reviews: 210,
    facilities: ["wifi"],
  },
  {
    id: 5,
    name: "Lanna Garden Hotel",
    location: "เชียงใหม่",
    thumbnail:
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1200&auto=format&fit=crop",
    pricePerNight: 1290,
    rating: 4.6,
    reviews: 655,
    facilities: ["wifi", "parking", "breakfast"],
    tags: ["บรรยากาศดี"],
  },
  {
    id: 6,
    name: "Andaman Hills",
    location: "ภูเก็ต",
    thumbnail:
      "https://images.unsplash.com/photo-1551776235-dde6d4829808?q=80&w=1200&auto=format&fit=crop",
    pricePerNight: 1790,
    rating: 4.3,
    reviews: 420,
    facilities: ["wifi", "pool"],
  },
  {
    id: 7,
    name: "Siam Residence",
    location: "กรุงเทพฯ",
    thumbnail:
      "https://images.unsplash.com/photo-1551776235-8d76f5a8f9bd?q=80&w=1200&auto=format&fit=crop",
    pricePerNight: 990,
    rating: 4.0,
    reviews: 198,
    facilities: ["wifi", "parking"],
  },
  {
    id: 8,
    name: "Nimman Stay",
    location: "เชียงใหม่",
    thumbnail:
      "https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?q=80&w=1200&auto=format&fit=crop",
    pricePerNight: 1790,
    rating: 4.7,
    reviews: 512,
    facilities: ["wifi", "parking", "breakfast"],
    tags: ["ย่านนิมมาน"],
  },
  {
    id: 9,
    name: "Patong Beachfront",
    location: "ภูเก็ต",
    thumbnail:
      "https://images.unsplash.com/photo-1520256862855-398228c41684?q=80&w=1200&auto=format&fit=crop",
    pricePerNight: 2150,
    rating: 4.4,
    reviews: 774,
    facilities: ["wifi", "beach", "pool"],
    tags: ["วิวดี"],
  },
  // เติมอีกนิดให้ดูเต็ม ๆ
  ...Array.from({ length: 9 }).map((_, i) => ({
    id: 10 + i,
    name: `Sample Hotel #${10 + i}`,
    location: ["กรุงเทพฯ", "เชียงใหม่", "ภูเก็ต"][(i % 3)],
    thumbnail:
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1200&auto=format&fit=crop",
    pricePerNight: 800 + (i % 5) * 350,
    rating: 3.8 + ((i * 7) % 12) / 10, // 3.8..5.0
    reviews: 120 + i * 13,
    facilities: ["wifi", ...(i % 2 ? ["parking"] : []), ...(i % 3 ? ["breakfast"] : []), ...(i % 4 ? ["pool"] : [])],
    tags: i % 2 ? ["คุ้มค่า"] : undefined,
  })),
];

/** ---------------- Utilities ---------------- */
const FACILITY_LABEL: Record<string, string> = {
  wifi: "Wi-Fi",
  parking: "ที่จอดรถ",
  pool: "สระว่ายน้ำ",
  beach: "ติดทะเล",
  breakfast: "อาหารเช้า",
};

const facilityIcon = (f: string) => {
  switch (f) {
    case "wifi":
      return <WifiOutlined />;
    case "parking":
      return <CarOutlined />;
    case "pool":
      return <HomeOutlined />;
    case "beach":
      return <HomeOutlined />;
    case "breakfast":
      return <DollarOutlined />;
    default:
      return null;
  }
};

/** ---------------- Component ---------------- */
const Hotels: React.FC = () => {
  // ค่าค้นหา
  const [query, setQuery] = useState("");
  const [dateRange, setDateRange] = useState<any>(null);
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);

  // ตัวกรอง
  const [priceRange, setPriceRange] = useState<[number, number]>([500, 3000]);
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);

  // อื่น ๆ
  const [sortKey, setSortKey] = useState<"relevant" | "price_asc" | "price_desc" | "rating_desc">("relevant");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(9);
  const [fav, setFav] = useState<number[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleFav = (id: number) => {
    setFav((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  // คัดกรอง + เรียงลำดับ
  const filtered = useMemo(() => {
    let list = HOTELS.filter((h) => {
      const matchQuery =
        !query ||
        h.name.toLowerCase().includes(query.toLowerCase()) ||
        h.location.toLowerCase().includes(query.toLowerCase());
      const withinPrice = h.pricePerNight >= priceRange[0] && h.pricePerNight <= priceRange[1];
      const ratingOK = h.rating >= minRating;
      const facilityOK = selectedFacilities.every((f) => h.facilities.includes(f));
      return matchQuery && withinPrice && ratingOK && facilityOK;
    });

    switch (sortKey) {
      case "price_asc":
        list = list.sort((a, b) => a.pricePerNight - b.pricePerNight);
        break;
      case "price_desc":
        list = list.sort((a, b) => b.pricePerNight - a.pricePerNight);
        break;
      case "rating_desc":
        list = list.sort((a, b) => b.rating - a.rating);
        break;
      default:
        // relevant: ให้เรตติ้งก่อน แล้วราคาถูกกว่า
        list = list.sort((a, b) => (b.rating - a.rating) || (a.pricePerNight - b.pricePerNight));
    }
    return list;
  }, [query, priceRange, minRating, selectedFacilities, sortKey]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  useEffect(() => setPage(1), [query, priceRange, minRating, selectedFacilities, sortKey]);

  // ปุ่มกลับขึ้นบน
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // ฟอร์มค้นหา (แถบบนแบบ Klook)
  const SearchBar = (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: 16,
        boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
      }}
    >
      <Row gutter={[12, 12]} align="middle">
        <Col xs={24} md={8}>
          <Input
            size="large"
            allowClear
            placeholder="ค้นหาที่พัก / เมือง เช่น กรุงเทพ, เชียงใหม่..."
            prefix={<EnvironmentOutlined style={{ color: "#1677ff" }} />}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </Col>
        <Col xs={24} md={8}>
          <RangePicker
            size="large"
            style={{ width: "100%" }}
            value={dateRange}
            onChange={setDateRange}
            disabledDate={(cur) => cur && cur < dayjs().startOf("day")}
            suffixIcon={<CalendarOutlined style={{ color: "#1677ff" }} />}
            placeholder={["วันเช็คอิน", "วันเช็คเอาท์"]}
          />
        </Col>
        <Col xs={12} md={4}>
          <Select
            size="large"
            value={guests}
            onChange={setGuests}
            style={{ width: "100%" }}
            suffixIcon={<StarFilled style={{ color: "#1677ff" }} />}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <Option key={n} value={n}>
                {n} ผู้เข้าพัก
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={12} md={4}>
          <Select size="large" value={rooms} onChange={setRooms} style={{ width: "100%" }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Option key={n} value={n}>
                {n} ห้อง
              </Option>
            ))}
          </Select>
        </Col>
      </Row>
      <Row justify="end" style={{ marginTop: 12 }}>
        <Space>
          <Button
            icon={<FilterOutlined />}
            onClick={() => setDrawerOpen(true)}
            className="lg:hidden"
            style={{ display: "inline-block" }}
          >
            ตัวกรอง
          </Button>
          <Button type="primary" size="large" icon={<SearchOutlined />}>
            ค้นหา
          </Button>
        </Space>
      </Row>
    </div>
  );

  // ตัวกรอง (ใช้ซ้ำทั้ง Drawer มือถือ และแถบซ้ายเดสก์ท็อป)
  const Filters = (
    <>
      <Title level={5} style={{ marginTop: 0 }}>
        ตัวกรอง
      </Title>

      <div style={{ marginBottom: 16 }}>
        <Text strong>ช่วงราคา (บาท/คืน)</Text>
        <Slider
          range
          min={300}
          max={4000}
          step={50}
          tooltip={{ formatter: (v) => `${v} ฿` }}
          value={priceRange}
          onChange={(v) => setPriceRange(v as [number, number])}
        />
        <Space>
          <Tag icon={<DollarOutlined />} color="blue">
            ขั้นต่ำ {priceRange[0].toLocaleString()}฿
          </Tag>
          <Tag icon={<DollarOutlined />} color="blue">
            สูงสุด {priceRange[1].toLocaleString()}฿
          </Tag>
        </Space>
      </div>

      <Divider style={{ margin: "12px 0" }} />

      <div style={{ marginBottom: 16 }}>
        <Text strong>เรตติ้งขั้นต่ำ</Text>
        <div style={{ marginTop: 8 }}>
          <Rate allowHalf value={minRating} onChange={setMinRating} />
          <Tag style={{ marginLeft: 8 }}>{minRating} ดาวขึ้นไป</Tag>
        </div>
      </div>

      <Divider style={{ margin: "12px 0" }} />

      <div>
        <Text strong>สิ่งอำนวยความสะดวก</Text>
        <Checkbox.Group
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: 8, marginTop: 8 }}
          value={selectedFacilities}
          onChange={(vals) => setSelectedFacilities(vals as string[])}
        >
          {Object.keys(FACILITY_LABEL).map((key) => (
            <Checkbox key={key} value={key}>
              <Space size="small">
                {facilityIcon(key)}
                {FACILITY_LABEL[key]}
              </Space>
            </Checkbox>
          ))}
        </Checkbox.Group>
      </div>
    </>
  );

  return (
    <div style={{ background: "#f7f9fb", minHeight: "100vh", padding: "16px 0 48px" }}>
      {/* แบนเนอร์หัว (เล็ก ๆ) */}
      <div
        style={{
          background: "linear-gradient(135deg,#1e88e5,#1565c0)",
          color: "#fff",
          padding: "28px 16px",
          marginBottom: 16,
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Title level={3} style={{ color: "#fff", margin: 0 }}>
            ค้นหาที่พัก
          </Title>
          <Text style={{ color: "rgba(255,255,255,0.85)" }}>
            เปรียบเทียบราคา เลือกตัวกรอง แล้วจองทริปของคุณได้เลย
          </Text>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>
        {/* แถบค้นหา */}
        {SearchBar}

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          {/* ซ้าย: ตัวกรอง (ซ่อนบนจอเล็ก ใช้ Drawer แทน) */}
          <Col xs={0} lg={6}>
            <div
              style={{
                background: "#fff",
                padding: 16,
                borderRadius: 12,
                boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                position: "sticky",
                top: 16,
              }}
            >
              {Filters}
            </div>
          </Col>

          {/* ขวา: รายการ & จัดเรียง */}
          <Col xs={24} lg={18}>
            <div
              style={{
                background: "#fff",
                padding: 12,
                borderRadius: 12,
                boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                marginBottom: 12,
              }}
            >
              <Row align="middle" justify="space-between" gutter={[8, 8]}>
                <Col>
                  <Space wrap>
                    <Tag color="geekblue">ทั้งหมด {filtered.length} แห่ง</Tag>
                    {query && (
                      <Tag closable onClose={() => setQuery("")}>
                        ค้นหา: {query}
                      </Tag>
                    )}
                    {(selectedFacilities.length > 0 || minRating > 0) && (
                      <Button
                        size="small"
                        onClick={() => {
                          setSelectedFacilities([]);
                          setMinRating(0);
                        }}
                      >
                        ล้างตัวกรอง
                      </Button>
                    )}
                  </Space>
                </Col>
                <Col>
                  <Space>
                    <Text type="secondary">จัดเรียง:</Text>
                    <Select value={sortKey} onChange={(v) => setSortKey(v)} style={{ width: 200 }} size="middle">
                      <Option value="relevant">แนะนำ</Option>
                      <Option value="price_asc">ราคาต่ำ → สูง</Option>
                      <Option value="price_desc">ราคาสูง → ต่ำ</Option>
                      <Option value="rating_desc">เรตติ้งสูงสุด</Option>
                    </Select>
                  </Space>
                </Col>
              </Row>
            </div>

            {/* รายการการ์ด */}
            {paged.length === 0 ? (
              <div style={{ background: "#fff", borderRadius: 12, padding: 32 }}>
                <Empty description="ไม่พบที่พักที่ตรงกับเงื่อนไข" />
              </div>
            ) : (
              <Row gutter={[16, 16]}>
                {paged.map((h) => (
                  <Col xs={24} sm={12} md={8} key={h.id}>
                    <Card
                      hoverable
                      cover={
                        <div style={{ position: "relative" }}>
                          <img
                            src={h.thumbnail}
                            alt={h.name}
                            style={{
                              width: "100%",
                              height: 160,
                              objectFit: "cover",
                              borderTopLeftRadius: 12,
                              borderTopRightRadius: 12,
                            }}
                          />
                          <Button
                            type="text"
                            onClick={() => toggleFav(h.id)}
                            style={{ position: "absolute", top: 8, right: 8 }}
                            icon={
                              fav.includes(h.id) ? (
                                <HeartTwoTone twoToneColor="#eb2f96" />
                              ) : (
                                <HeartOutlined style={{ color: "#fff" }} />
                              )
                            }
                          />
                        </div>
                      }
                      style={{ borderRadius: 12, overflow: "hidden" }}
                    >
                      <Space direction="vertical" size={4} style={{ width: "100%" }}>
                        <Text type="secondary">{h.location}</Text>
                        <Title level={5} style={{ margin: 0 }}>
                          {h.name}
                        </Title>
                        <Space size="small" align="center">
                          <Rate disabled allowHalf value={h.rating} style={{ fontSize: 14 }} />
                          <Text strong>{h.rating.toFixed(1)}</Text>
                          <Text type="secondary">({h.reviews.toLocaleString()})</Text>
                        </Space>

                        <Space wrap size={[6, 6]} style={{ marginTop: 4 }}>
                          {h.facilities.slice(0, 3).map((f) => (
                            <Tag key={f} icon={facilityIcon(f)}>
                              {FACILITY_LABEL[f]}
                            </Tag>
                          ))}
                          {(h.tags || []).map((t) => (
                            <Tag color="blue" key={t}>
                              {t}
                            </Tag>
                          ))}
                        </Space>

                        <Divider style={{ margin: "8px 0" }} />

                        <Row justify="space-between" align="middle">
                          <Col>
                            <Text type="secondary">เริ่มต้น</Text>
                            <div>
                              <Title level={4} style={{ margin: 0, color: "#1677ff" }}>
                                {h.pricePerNight.toLocaleString()} ฿
                              </Title>
                              <Text type="secondary">/ คืน</Text>
                            </div>
                          </Col>
                          <Col>
                            <Button type="primary">ดูรายละเอียด</Button>
                          </Col>
                        </Row>
                      </Space>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}

            {/* เพจจิเนชัน */}
            <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
              <Pagination
                current={page}
                pageSize={pageSize}
                total={filtered.length}
                onChange={setPage}
                showSizeChanger={false}
              />
            </div>
          </Col>
        </Row>
      </div>

      {/* ตัวกรอง (Drawer สำหรับจอเล็ก) */}
      <Drawer
        title="ตัวกรอง"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        placement="right"
        width={320}
      >
        {Filters}
        <Divider />
        <Button type="primary" block onClick={() => setDrawerOpen(false)}>
          ใช้ตัวกรอง
        </Button>
      </Drawer>

      {/* ปุ่มกลับขึ้นบน */}
      <Button
        type="primary"
        shape="circle"
        icon={<UpOutlined />}
        onClick={scrollToTop}
        style={{
          position: "fixed",
          right: 24,
          bottom: 24,
          opacity: showTop ? 1 : 0,
          transform: showTop ? "translateY(0)" : "translateY(12px)",
          pointerEvents: showTop ? "auto" : "none",
          boxShadow: "0 8px 18px rgba(0,0,0,0.2)",
          transition: "all .25s",
        }}
      />
    </div>
  );
};

export default Hotels;

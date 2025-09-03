import React, { useMemo, useState, useEffect } from "react";
import {
  Row, Col, Input, DatePicker, Select, Button, Card, Rate, Tag,
  Slider, Space, Divider, Typography, Pagination, Drawer, Empty, Checkbox,
} from "antd";
import {
  SearchOutlined, CalendarOutlined, EnvironmentOutlined, FilterOutlined,
  StarFilled, DollarOutlined, HeartOutlined, HeartTwoTone, UpOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

/** ---------- Mock Data: แพ็คเกจทัวร์ ---------- */
type TravelPackage = {
  id: number;
  name: string;
  location: string;
  thumbnail: string;
  pricePerPerson: number;
  rating: number;   // 0..5
  reviews: number;
  days: number;     // ระยะเวลา (วัน)
  category: "city" | "beach" | "adventure" | "culture" | "nature";
  tags?: string[];
};

const PKGS: TravelPackage[] = [
  {
    id: 1,
    name: "Bangkok City Highlights 3D2N",
    location: "กรุงเทพฯ",
    thumbnail: "https://images.unsplash.com/photo-1549693578-d683be217e58?q=80&w=1200&auto=format&fit=crop",
    pricePerPerson: 3990,
    rating: 4.6,
    reviews: 1120,
    days: 3,
    category: "city",
    tags: ["พระบรมมหาราชวัง", "ไชน่าทาวน์"],
  },
  {
    id: 2,
    name: "Chiang Mai Slow Life 4D3N",
    location: "เชียงใหม่",
    thumbnail: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop",
    pricePerPerson: 5490,
    rating: 4.7,
    reviews: 860,
    days: 4,
    category: "culture",
    tags: ["ดอยสุเทพ", "คาเฟ่วิวเขา"],
  },
  {
    id: 3,
    name: "Phuket Beach Escape 3D2N",
    location: "ภูเก็ต",
    thumbnail: "https://images.unsplash.com/photo-1519822471302-3d0b5a3cb0f0?q=80&w=1200&auto=format&fit=crop",
    pricePerPerson: 6290,
    rating: 4.8,
    reviews: 1450,
    days: 3,
    category: "beach",
    tags: ["ล่องเรือ", "ดำน้ำตื้น"],
  },
  {
    id: 4,
    name: "Krabi Island Hopping 4D3N",
    location: "กระบี่",
    thumbnail: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=1200&auto=format&fit=crop",
    pricePerPerson: 6890,
    rating: 4.5,
    reviews: 620,
    days: 4,
    category: "beach",
    tags: ["เกาะพีพี", "ทะเลแหวก"],
  },
  {
    id: 5,
    name: "Kanchanaburi Adventure 2D1N",
    location: "กาญจนบุรี",
    thumbnail: "https://images.unsplash.com/photo-1472396961693-142e6e269027?q=80&w=1200&auto=format&fit=crop",
    pricePerPerson: 2990,
    rating: 4.2,
    reviews: 310,
    days: 2,
    category: "adventure",
    tags: ["ล่องแพ", "สะพานข้ามแม่น้ำแคว"],
  },
  {
    id: 6,
    name: "Nan Nature Retreat 3D2N",
    location: "น่าน",
    thumbnail: "https://images.unsplash.com/photo-1495344517868-8ebaf0a2044a?q=80&w=1200&auto=format&fit=crop",
    pricePerPerson: 4590,
    rating: 4.4,
    reviews: 280,
    days: 3,
    category: "nature",
    tags: ["ทะเลหมอก", "โฮมสเตย์"],
  },
  // เติมตัวอย่างให้พอเลื่อนเพจได้
  ...Array.from({ length: 9 }).map((_, i) => ({
    id: 100 + i,
    name: `Sample Package #${100 + i}`,
    location: ["กรุงเทพฯ", "เชียงใหม่", "ภูเก็ต", "กระบี่", "ขอนแก่น"][i % 5],
    thumbnail: "https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?q=80&w=1200&auto=format&fit=crop",
    pricePerPerson: 2500 + (i % 6) * 800,
    rating: 3.8 + (((i * 5) % 12) / 10), // ~3.8..5.0
    reviews: 120 + i * 15,
    days: 2 + (i % 5), // 2..6
    category: (["city", "beach", "adventure", "culture", "nature"] as const)[i % 5],
    tags: i % 2 ? ["คุ้มค่า"] : ["ยอดนิยม"],
  })),
];

/** ---------- Page Component ---------- */
const PackagesPage: React.FC = () => {
  // ค่าค้นหา
  const [query, setQuery] = useState("");
  const [dateRange, setDateRange] = useState<any>(null);
  const [travellers, setTravellers] = useState(2);

  // ตัวกรอง
  const [priceRange, setPriceRange] = useState<[number, number]>([2000, 10000]);
  const [minRating, setMinRating] = useState<number>(0);
  const [daysRange, setDaysRange] = useState<[number, number]>([2, 7]);
  const [categories, setCategories] = useState<string[]>([]);

  // เรียง/เพจ
  const [sortKey, setSortKey] =
    useState<"relevant" | "price_asc" | "price_desc" | "rating_desc" | "days_asc">("relevant");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(9);
  const [fav, setFav] = useState<number[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleFav = (id: number) => {
    setFav((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  // คัดกรอง + เรียง
  const filtered = useMemo(() => {
    let list = PKGS.filter((p) => {
      const matchQuery =
        !query ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.location.toLowerCase().includes(query.toLowerCase());
      const withinPrice = p.pricePerPerson >= priceRange[0] && p.pricePerPerson <= priceRange[1];
      const ratingOK = p.rating >= minRating;
      const withinDays = p.days >= daysRange[0] && p.days <= daysRange[1];
      const categoryOK = categories.length === 0 || categories.includes(p.category);
      return matchQuery && withinPrice && ratingOK && withinDays && categoryOK;
    });

    switch (sortKey) {
      case "price_asc":
        list = list.sort((a, b) => a.pricePerPerson - b.pricePerPerson);
        break;
      case "price_desc":
        list = list.sort((a, b) => b.pricePerPerson - a.pricePerPerson);
        break;
      case "rating_desc":
        list = list.sort((a, b) => b.rating - a.rating);
        break;
      case "days_asc":
        list = list.sort((a, b) => a.days - b.days);
        break;
      default:
        // relevant: เรตติ้งก่อน ราคาเบากว่า และสั้นกว่าก่อนเล็กน้อย
        list = list.sort(
          (a, b) => (b.rating - a.rating) || (a.pricePerPerson - b.pricePerPerson) || (a.days - b.days)
        );
    }
    return list;
  }, [query, priceRange, minRating, daysRange, categories, sortKey]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  useEffect(() => setPage(1), [query, priceRange, minRating, daysRange, categories, sortKey]);

  // ปุ่มขึ้นบน
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // แถบค้นหา (หัวหน้า)
  const SearchBar = (
    <div style={{ background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 6px 20px rgba(0,0,0,0.08)" }}>
      <Row gutter={[12, 12]} align="middle">
        <Col xs={24} md={8}>
          <Input
            size="large"
            allowClear
            placeholder="ค้นหาแพ็คเกจ / เมือง เช่น ภูเก็ต, เชียงใหม่..."
            prefix={<EnvironmentOutlined style={{ color: "#1677ff" }} />}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </Col>
        <Col xs={24} md={10}>
          <RangePicker
            size="large"
            style={{ width: "100%" }}
            value={dateRange}
            onChange={setDateRange}
            disabledDate={(cur) => cur && cur < dayjs().startOf("day")}
            suffixIcon={<CalendarOutlined style={{ color: "#1677ff" }} />}
            placeholder={["วันออกเดินทาง (ไม่บังคับ)", "วันสิ้นสุด"]}
          />
        </Col>
        <Col xs={24} md={6}>
          <Select
            size="large"
            value={travellers}
            onChange={setTravellers}
            style={{ width: "100%" }}
            suffixIcon={<StarFilled style={{ color: "#1677ff" }} />}
          >
            {[1,2,3,4,5,6,7,8,9,10].map((n) => (
              <Option key={n} value={n}>{n} คนเดินทาง</Option>
            ))}
          </Select>
        </Col>
      </Row>
      <Row justify="end" style={{ marginTop: 12 }}>
        <Space>
          <Button icon={<FilterOutlined />} onClick={() => setDrawerOpen(true)}>
            ตัวกรอง
          </Button>
          <Button type="primary" size="large" icon={<SearchOutlined />}>
            ค้นหา
          </Button>
        </Space>
      </Row>
    </div>
  );

  // ตัวกรอง (ใช้ซ้ำ)
  const Filters = (
    <>
      <Title level={5} style={{ marginTop: 0 }}>ตัวกรอง</Title>

      <div style={{ marginBottom: 16 }}>
        <Text strong>ช่วงราคา (บาท/คน)</Text>
        <Slider
          range min={1500} max={20000} step={100}
          tooltip={{ formatter: (v) => `${v} ฿` }}
          value={priceRange}
          onChange={(v) => setPriceRange(v as [number, number])}
        />
        <Space>
          <Tag icon={<DollarOutlined />} color="blue">ขั้นต่ำ {priceRange[0].toLocaleString()}฿</Tag>
          <Tag icon={<DollarOutlined />} color="blue">สูงสุด {priceRange[1].toLocaleString()}฿</Tag>
        </Space>
      </div>

      <Divider style={{ margin: "12px 0" }} />

      <div style={{ marginBottom: 16 }}>
        <Text strong>จำนวนวันของทริป</Text>
        <Slider
          range min={2} max={10} step={1}
          value={daysRange}
          onChange={(v) => setDaysRange(v as [number, number])}
          tooltip={{ formatter: (v) => `${v} วัน` }}
        />
        <Tag>ระยะเวลา: {daysRange[0]}–{daysRange[1]} วัน</Tag>
      </div>

      <Divider style={{ margin: "12px 0" }} />

      <div style={{ marginBottom: 8 }}>
        <Text strong>เรตติ้งขั้นต่ำ</Text>
        <div style={{ marginTop: 8 }}>
          <Rate allowHalf value={minRating} onChange={setMinRating} />
          <Tag style={{ marginLeft: 8 }}>{minRating} ดาวขึ้นไป</Tag>
        </div>
      </div>

      <Divider style={{ margin: "12px 0" }} />

      <div style={{ marginBottom: 8 }}>
        <Text strong>ประเภทแพ็คเกจ</Text>
        <Checkbox.Group
          style={{ display: "block", marginTop: 8 }}
          value={categories}
          onChange={(vals) => setCategories(vals as string[])}
        >
          <Space direction="vertical">
            <Checkbox value="city">เมือง/ชอปปิง</Checkbox>
            <Checkbox value="beach">ทะเล/ชายหาด</Checkbox>
            <Checkbox value="adventure">ผจญภัย</Checkbox>
            <Checkbox value="culture">วัฒนธรรม/ประวัติศาสตร์</Checkbox>
            <Checkbox value="nature">ธรรมชาติ</Checkbox>
          </Space>
        </Checkbox.Group>
      </div>
    </>
  );

  return (
    <div style={{ background: "#f7f9fb", minHeight: "100vh", padding: "16px 0 48px" }}>
      {/* แบนเนอร์หัว */}
      <div
        style={{
          background: "linear-gradient(135deg,#7b1fa2,#512da8)",
          color: "#fff",
          padding: "28px 16px",
          marginBottom: 16,
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Title level={3} style={{ color: "#fff", margin: 0 }}>ค้นหาแพ็คเกจทัวร์</Title>
          <Text style={{ color: "rgba(255,255,255,0.85)" }}>
            เลือกประเภททริป งบ และจำนวนวัน แล้วออกเดินทางกันเถอะ!
          </Text>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>
        {/* แถบค้นหา */}
        {SearchBar}

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          {/* ซ้าย: ตัวกรอง (เดสก์ท็อป) */}
          <Col xs={0} lg={6}>
            <div
              style={{
                background: "#fff", padding: 16, borderRadius: 12,
                boxShadow: "0 6px 20px rgba(0,0,0,0.06)", position: "sticky", top: 16,
              }}
            >
              {Filters}
            </div>
          </Col>

          {/* ขวา: รายการ & จัดเรียง */}
          <Col xs={24} lg={18}>
            <div
              style={{
                background: "#fff", padding: 12, borderRadius: 12,
                boxShadow: "0 6px 20px rgba(0,0,0,0.06)", marginBottom: 12,
              }}
            >
              <Row align="middle" justify="space-between" gutter={[8, 8]}>
                <Col>
                  <Space wrap>
                    <Tag color="geekblue">ทั้งหมด {filtered.length} แพ็คเกจ</Tag>
                    {query && <Tag closable onClose={() => setQuery("")}>ค้นหา: {query}</Tag>}
                    {(minRating > 0 || categories.length > 0 || daysRange[0] > 2 || daysRange[1] < 10) && (
                      <Button size="small" onClick={() => {
                        setMinRating(0);
                        setCategories([]);
                        setDaysRange([2, 7]);
                      }}>
                        ล้างตัวกรอง
                      </Button>
                    )}
                  </Space>
                </Col>
                <Col>
                  <Space>
                    <Text type="secondary">จัดเรียง:</Text>
                    <Select value={sortKey} onChange={(v) => setSortKey(v)} style={{ width: 220 }} size="middle">
                      <Option value="relevant">แนะนำ</Option>
                      <Option value="price_asc">ราคาต่ำ → สูง</Option>
                      <Option value="price_desc">ราคาสูง → ต่ำ</Option>
                      <Option value="rating_desc">เรตติ้งสูงสุด</Option>
                      <Option value="days_asc">ทริปสั้นก่อน</Option>
                    </Select>
                  </Space>
                </Col>
              </Row>
            </div>

            {/* รายการการ์ด */}
            {paged.length === 0 ? (
              <div style={{ background: "#fff", borderRadius: 12, padding: 32 }}>
                <Empty description="ไม่พบแพ็คเกจที่ตรงกับเงื่อนไข" />
              </div>
            ) : (
              <Row gutter={[16, 16]}>
                {paged.map((p) => (
                  <Col xs={24} sm={12} md={8} key={p.id}>
                    <Card
                      hoverable
                      cover={
                        <div style={{ position: "relative" }}>
                          <img
                            src={p.thumbnail}
                            alt={p.name}
                            style={{ width: "100%", height: 160, objectFit: "cover", borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
                          />
                          <Button
                            type="text"
                            onClick={() => toggleFav(p.id)}
                            style={{ position: "absolute", top: 8, right: 8 }}
                            icon={fav.includes(p.id) ? <HeartTwoTone twoToneColor="#eb2f96" /> : <HeartOutlined style={{ color: "#fff" }} />}
                          />
                        </div>
                      }
                      style={{ borderRadius: 12, overflow: "hidden" }}
                    >
                      <Space direction="vertical" size={4} style={{ width: "100%" }}>
                        <Text type="secondary">{p.location} • {p.days} วัน</Text>
                        <Title level={5} style={{ margin: 0 }}>{p.name}</Title>
                        <Space size="small" align="center">
                          <Rate disabled allowHalf value={p.rating} style={{ fontSize: 14 }} />
                          <Text strong>{p.rating.toFixed(1)}</Text>
                          <Text type="secondary">({p.reviews.toLocaleString()})</Text>
                        </Space>

                        {p.tags && (
                          <Space wrap style={{ marginTop: 4 }}>
                            {p.tags.map((t, i) => (
                              <Tag key={i} color="processing">{t}</Tag>
                            ))}
                          </Space>
                        )}

                        <Divider style={{ margin: "8px 0" }} />

                        <Row justify="space-between" align="middle">
                          <Col>
                            <Text type="secondary">เริ่มต้น</Text>
                            <div>
                              <Title level={4} style={{ margin: 0, color: "#1677ff" }}>
                                {p.pricePerPerson.toLocaleString()} ฿
                              </Title>
                              <Text type="secondary">/ คน</Text>
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
              <Pagination current={page} pageSize={pageSize} total={filtered.length} onChange={setPage} showSizeChanger={false} />
            </div>
          </Col>
        </Row>
      </div>

      {/* Drawer ตัวกรอง (มือถือ) */}
      <Drawer title="ตัวกรอง" open={drawerOpen} onClose={() => setDrawerOpen(false)} placement="right" width={320}>
        {Filters}
        <Divider />
        <Button type="primary" block onClick={() => setDrawerOpen(false)}>ใช้ตัวกรอง</Button>
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

export default PackagesPage;

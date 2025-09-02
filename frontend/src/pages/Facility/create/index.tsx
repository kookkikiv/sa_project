// src/pages/Facility/create/index.tsx
import { useEffect, useMemo, useState } from "react";
import {
  Row, Col, Card, Form, Select, Button, Space, Alert, message, Divider,
} from "antd";
import { SaveOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";

// ---------------- basics ----------------
const apiUrl = "http://localhost:8000";
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  const tokenType = localStorage.getItem("token_type");
  return {
    "Content-Type": "application/json",
    ...(token && tokenType ? { Authorization: `${tokenType} ${token}` } : {}),
  };
};
const asArray = <T,>(v: any): T[] =>
  Array.isArray(v) ? v : Array.isArray(v?.data) ? v.data : Array.isArray(v?.items) ? v.items : [];

// APIs
async function createFacility(body: any) {
  const res = await fetch(`${apiUrl}/facility`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, data: json };
}
async function fetchAccommodations() {
  const res = await fetch(`${apiUrl}/accommodation`, { headers: getAuthHeaders() });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, data: json?.data ?? json };
}
async function fetchRooms() {
  const res = await fetch(`${apiUrl}/room`, { headers: getAuthHeaders() });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, data: json?.data ?? json };
}

// constant options
const FACILITY_TYPES = [
  { value: "accommodation", label: "สิ่งอำนวยความสะดวกในที่พัก" },
  { value: "room", label: "สิ่งอำนวยความสะดวกในห้องพัก" },
];
const FACILITY_OPTIONS = {
  accommodation: [
    { value: "swimming_pool", label: "สระว่ายน้ำ" },
    { value: "fitness_center", label: "ห้องออกกำลังกาย" },
    { value: "restaurant", label: "ร้านอาหาร" },
    { value: "parking", label: "ที่จอดรถ" },
    { value: "wifi_lobby", label: "WiFi ในล็อบบี้" },
    { value: "elevator", label: "ลิฟต์" },
  ],
  room: [
    { value: "air_conditioning", label: "เครื่องปรับอากาศ" },
    { value: "towel", label: "ผ้าเช็ดตัว" },
    { value: "hair_dryer", label: "ไดร์เป่าผม" },
    { value: "wifi", label: "WiFi" },
    { value: "tv", label: "โทรทัศน์" },
  ],
};

export default function FacilityCreate() {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [type, setType] = useState<string>("");
  const [accommodations, setAccommodations] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [accForRoom, setAccForRoom] = useState<number | null>(null);

  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  // load masters
  useEffect(() => {
    (async () => {
      setLoadingData(true);
      try {
        const [acc, rm] = await Promise.all([fetchAccommodations(), fetchRooms()]);
        setAccommodations(asArray<any>(acc.data));
        setRooms(asArray<any>(rm.data)); // ควร Preload Accommodation จาก backend
      } finally {
        setLoadingData(false);
      }
    })();
  }, []);

  // options
  const facilityNameOptions = type ? FACILITY_OPTIONS[type as keyof typeof FACILITY_OPTIONS] : [];
  const accommodationOptions = useMemo(
    () =>
      (accommodations ?? []).map((a: any) => ({
        value: Number(a.ID ?? a.id),
        label: a.Name ?? a.name ?? `ที่พัก #${a.ID ?? a.id}`,
      })),
    [accommodations]
  );
  const roomOptions = useMemo(() => {
    const getAccIdFromRoom = (r: any) =>
      r.AccommodationID ?? r.accommodation_id ?? r.Accommodation?.ID ?? r.accommodation?.ID;
    const getAccNameFromRoom = (r: any) =>
      r.Accommodation?.Name ?? r.accommodation?.Name ?? r.accommodation?.name;
    return (rooms ?? [])
      .filter((r: any) => (accForRoom ? getAccIdFromRoom(r) === accForRoom : false))
      .map((r: any) => ({
        value: Number(r.ID ?? r.id),
        label: `${r.Name ?? r.name ?? `ห้อง #${r.ID ?? r.id}`} (${getAccNameFromRoom(r) ?? `ที่พัก #${getAccIdFromRoom(r) ?? "-"}`})`,
      }));
  }, [rooms, accForRoom]);

  // submit
  const onFinish = async (values: any) => {
    try {
      setSaving(true);
      const picked = (facilityNameOptions || []).find((o) => o.value === values.Name);
      const payload = {
        Name: picked ? picked.label : values.Name,
        Type: values.Type,
        accommodation_id: values.Type === "accommodation" ? values.AccommodationID : null,
        room_id: values.Type === "room" ? values.RoomID : null,
      };

      if (!payload.Name || !payload.Type) {
        messageApi.error("กรุณากรอกข้อมูลให้ครบถ้วน");
        return;
      }
      if (payload.Type === "accommodation" && !payload.accommodation_id) {
        messageApi.error("กรุณาเลือกที่พัก");
        return;
      }
      if (payload.Type === "room" && !payload.room_id) {
        messageApi.error("กรุณาเลือกห้องพัก");
        return;
      }

      const res = await createFacility(payload);
      if (res.status === 200 || res.status === 201) {
        messageApi.success(res.data?.message || "เพิ่มข้อมูลสิ่งอำนวยความสะดวกสำเร็จ");
        navigate("/accommodation/facility");
      } else {
        messageApi.error(res.data?.error || "เพิ่มข้อมูลไม่สำเร็จ");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {contextHolder}

      <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Link to="/accommodation/facility">
            <Button icon={<ArrowLeftOutlined />} size="large">กลับ</Button>
          </Link>
        </Col>
        <Col flex="auto">
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>เพิ่มข้อมูลสิ่งอำนวยความสะดวกใหม่</h2>
        </Col>
      </Row>

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
        message="คำอธิบาย"
        description={
          <>
            <p><b>ในที่พัก</b> เช่น สระว่ายน้ำ / ร้านอาหาร (ต้องเลือกที่พัก)</p>
            <p><b>ในห้องพัก</b> เช่น แอร์ / WiFi (ต้องเลือก “ที่พักของห้อง” ก่อน แล้วค่อยเลือกห้อง)</p>
          </>
        }
      />

      <Card style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)", borderRadius: 8 }}>
        <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
          <Row gutter={[24, 16]}>
            <Col span={24}>
              <Divider orientation="left" style={{ fontSize: 16, fontWeight: 500 }}>
                ข้อมูลสิ่งอำนวยความสะดวก
              </Divider>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="ประเภทสิ่งอำนวยความสะดวก"
                name="Type"
                rules={[{ required: true, message: "กรุณาเลือกประเภทสิ่งอำนวยความสะดวก" }]}
              >
                <Select
                  placeholder="เลือกประเภทสิ่งอำนวยความสะดวก"
                  size="large"
                  options={FACILITY_TYPES}
                  onChange={(v) => {
                    setType(v);
                    setAccForRoom(null);
                    form.setFieldsValue({ Name: undefined, AccommodationID: undefined, RoomAccommodationID: undefined, RoomID: undefined });
                  }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="ชื่อสิ่งอำนวยความสะดวก"
                name="Name"
                rules={[{ required: true, message: "กรุณาเลือกชื่อสิ่งอำนวยความสะดวก" }]}
              >
                <Select
                  placeholder={type ? "เลือกสิ่งอำนวยความสะดวก" : "กรุณาเลือกประเภทก่อน"}
                  size="large"
                  disabled={!type}
                  showSearch
                  optionFilterProp="label"
                  options={facilityNameOptions}
                />
              </Form.Item>
            </Col>

            {/* mode: accommodation */}
            {type === "accommodation" && (
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="เลือกที่พัก"
                  name="AccommodationID"
                  rules={[{ required: true, message: "กรุณาเลือกที่พัก" }]}
                >
                  <Select
                    placeholder="เลือกที่พัก"
                    size="large"
                    showSearch
                    optionFilterProp="label"
                    loading={loadingData}
                    options={accommodationOptions}
                  />
                </Form.Item>
              </Col>
            )}

            {/* mode: room */}
            {type === "room" && (
              <>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    label="ที่พักของห้อง"
                    name="RoomAccommodationID"
                    rules={[{ required: true, message: "กรุณาเลือกที่พักของห้อง" }]}
                  >
                    <Select
                      placeholder="เลือกที่พักก่อน แล้วจึงเลือกห้อง"
                      size="large"
                      showSearch
                      optionFilterProp="label"
                      loading={loadingData}
                      options={accommodationOptions}
                      onChange={(v: number | undefined) => {
                        setAccForRoom(v ?? null);
                        form.setFieldsValue({ RoomID: undefined });
                      }}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    label="เลือกห้องพัก"
                    name="RoomID"
                    rules={[{ required: true, message: "กรุณาเลือกห้องพัก" }]}
                  >
                    <Select
                      placeholder={accForRoom ? "เลือกห้องของที่พักที่เลือก" : "กรุณาเลือกที่พักของห้องก่อน"}
                      size="large"
                      disabled={!accForRoom}
                      showSearch
                      optionFilterProp="label"
                      loading={loadingData}
                      options={roomOptions}
                    />
                  </Form.Item>
                </Col>
              </>
            )}
          </Row>

          <Row justify="end" style={{ marginTop: 32 }}>
            <Col>
              <Space size="middle">
                <Link to="/accommodation/facility">
                  <Button size="large" disabled={saving}>ยกเลิก</Button>
                </Link>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} size="large" loading={saving}>
                  {saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
}

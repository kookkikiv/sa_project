// src/pages/Facility/edit/index.tsx
import { useEffect, useMemo, useState } from "react";
import {
  Row, Col, Card, Form, Select, Button, Space, Alert, message, Divider,
} from "antd";
import { SaveOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { Link, useNavigate, useParams } from "react-router-dom";

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

// ---- APIs ----
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
async function getFacilityById(id: string | number) {
  const res = await fetch(`${apiUrl}/facility/${id}`, { headers: getAuthHeaders() });
  if (!res.ok) return { status: res.status, data: null, error: await res.text() };
  const json = await res.json().catch(() => ({}));
  return { status: res.status, data: json?.data ?? json, error: null };
}
async function updateFacilityById(id: string | number, body: any) {
  const res = await fetch(`${apiUrl}/facility/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, data: json };
}

// ---- constants ----
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
} as const;

type FacilityForm = {
  Type?: "accommodation" | "room";
  Name?: string;
  AccommodationID?: number;      // โหมดที่พัก
  RoomAccommodationID?: number;  // โหมดห้อง: ที่พักของห้อง
  RoomID?: number;               // โหมดห้อง: ห้อง
};

export default function FacilityEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm<FacilityForm>();
  const [messageApi, contextHolder] = message.useMessage();

  const [type, setType] = useState<FacilityForm["Type"]>();
  const [accommodations, setAccommodations] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [accForRoom, setAccForRoom] = useState<number | null>(null);

  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  const accommodationOptions = useMemo(
    () =>
      (accommodations ?? []).map((a: any) => ({
        value: Number(a.ID ?? a.id),
        label: a.Name ?? a.name ?? `ที่พัก #${a.ID ?? a.id}`,
      })),
    [accommodations]
  );

  const getAccIdFromRoom = (r: any) =>
    r.AccommodationID ?? r.accommodation_id ?? r.Accommodation?.ID ?? r.accommodation?.ID;
  const getAccNameFromRoom = (r: any) =>
    r.Accommodation?.Name ?? r.accommodation?.Name ?? r.accommodation?.name;

  const roomOptions = useMemo(() => {
    return (rooms ?? [])
      .filter((r: any) => (accForRoom ? getAccIdFromRoom(r) === accForRoom : false))
      .map((r: any) => ({
        value: Number(r.ID ?? r.id),
        label: `${r.Name ?? r.name ?? `ห้อง #${r.ID ?? r.id}`} (${getAccNameFromRoom(r) ?? `ที่พัก #${getAccIdFromRoom(r) ?? "-"}`})`,
      }));
  }, [rooms, accForRoom]);

  // init
  useEffect(() => {
    (async () => {
      setLoadingData(true);
      try {
        const [accRes, roomRes] = await Promise.all([fetchAccommodations(), fetchRooms()]);
        setAccommodations(asArray<any>(accRes.data));
        setRooms(asArray<any>(roomRes.data));

        const fac = await getFacilityById(id!);
        if (fac.status !== 200 || !fac.data) {
          messageApi.error(fac.error || "ไม่พบข้อมูลสิ่งอำนวยความสะดวก");
          navigate("/accommodation/facility");
          return;
        }
        const data = fac.data as any;

        const initial: FacilityForm = {
          Type: data.Type ?? data.type,
          Name: data.Name ?? data.name,
        };
        const t = initial.Type;
        setType(t);

        if (t === "accommodation") {
          initial.AccommodationID =
            data.AccommodationID ?? data.accommodation_id ?? data.Accommodation?.ID ?? data.accommodation?.ID;
        } else if (t === "room") {
          const roomId = data.RoomID ?? data.room_id ?? data.Room?.ID ?? data.room?.ID;
          initial.RoomID = roomId;

          let roomAccId =
            data.AccommodationID ??
            data.accommodation_id ??
            data.Accommodation?.ID ??
            data.accommodation?.ID;

          if (!roomAccId && roomId) {
            const r = asArray<any>(roomRes.data).find((x) => Number(x.ID ?? x.id) === Number(roomId));
            roomAccId = r ? getAccIdFromRoom(r) : undefined;
          }
          if (roomAccId) {
            initial.RoomAccommodationID = Number(roomAccId);
            setAccForRoom(Number(roomAccId));
          }
        }

        form.setFieldsValue(initial);
      } finally {
        setLoadingData(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const facilityNameOptions =
    type ? (FACILITY_OPTIONS as any)[type] as Array<{ value: string; label: string }> : [];

  const onFinish = async (values: FacilityForm) => {
    try {
      setSaving(true);
      const picked = facilityNameOptions.find((o) => o.value === values.Name);

      // ส่ง snake_case ให้ backend
      const payload = {
        Name: picked ? picked.label : values.Name,
        Type: values.Type,
        accommodation_id:
          values.Type === "accommodation"
            ? values.AccommodationID
            : values.Type === "room"
            ? values.RoomAccommodationID
            : null,
        room_id: values.Type === "room" ? values.RoomID : null,
      };

      const res = await updateFacilityById(id!, payload);
      if (res.status === 200) {
        messageApi.success(res.data?.message || "บันทึกสำเร็จ");
        navigate("/accommodation/facility");
      } else {
        messageApi.error(res.data?.error || "บันทึกไม่สำเร็จ");
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
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>แก้ไขข้อมูลสิ่งอำนวยความสะดวก</h2>
        </Col>
      </Row>

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
        message="คำอธิบาย"
        description={
          <>
            <p><b>ในที่พัก</b> : ต้องเลือกที่พัก</p>
            <p><b>ในห้องพัก</b> : ต้องเลือก <b>ที่พักของห้อง</b> ก่อน แล้วจึงเลือก <b>ห้องพัก</b></p>
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
                  loading={loadingData}
                  options={FACILITY_TYPES}
                  onChange={(v: FacilityForm["Type"]) => {
                    setType(v);
                    setAccForRoom(null);
                    form.setFieldsValue({
                      Name: undefined,
                      AccommodationID: undefined,
                      RoomAccommodationID: undefined,
                      RoomID: undefined,
                    });
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

            {/* โหมดที่พัก */}
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

            {/* โหมดห้องพัก */}
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
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  size="large"
                  loading={saving}
                >
                  {saving ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
}

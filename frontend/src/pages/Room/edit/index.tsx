// src/pages/Room/edit/index.tsx
import { useEffect, useState } from "react";
import {
  Space,
  Button,
  Col,
  Row,
  Divider,
  Form,
  Input,
  Card,
  message,
  Select,
  InputNumber,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate, Link, useParams } from "react-router-dom";

import {
  GetAccommodation,
  GetRoomById,
  UpdateRoomById,
} from "../../../services/https";

type RoomForm = {
  Name?: string;
  Type?: string;
  BedType?: string;
  People?: number;
  Price?: number;
  Status?: string;
  AccommodationID?: number;
};

type AccommodationLite = { ID: number; Name?: string };

// helpers
const asArray = <T,>(val: any): T[] =>
  Array.isArray(val) ? (val as T[])
  : Array.isArray(val?.data) ? (val.data as T[])
  : Array.isArray(val?.items) ? (val.items as T[])
  : [];

const pick = (...vals: any[]) =>
  vals.find((v) => v !== undefined && v !== null && v !== "");

const ROOM_TYPES = [
  { value: "standard", label: "ห้องมาตรฐาน" },
  { value: "suite", label: "ห้องสวีท" },
  { value: "family", label: "ห้องครอบครัว" },
];

const BED_TYPES = [
  { value: "single", label: "เตียงเดี่ยว" },
  { value: "double", label: "เตียงคู่" },
  { value: "twin", label: "เตียงคู่แยก" },
  { value: "king", label: "คิงไซส์" },
];

const ROOM_STATUS = [
  { value: "open", label: "เปิดให้บริการ" },
  { value: "closed", label: "ปิดปรับปรุง" },
];

export default function RoomEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm<RoomForm>();

  const [accommodations, setAccommodations] = useState<AccommodationLite[]>([]);
  const [loadingAcc, setLoadingAcc] = useState(false);
  const [saving, setSaving] = useState(false);

  // โหลดรายชื่อที่พัก (เพื่อให้ Select แสดงชื่อจริง)
  const fetchAccommodations = async () => {
    setLoadingAcc(true);
    try {
      const res = await GetAccommodation();
      setAccommodations(asArray<AccommodationLite>(res?.data));
    } catch {
      setAccommodations([]);
      messageApi.error("โหลดรายชื่อที่พักไม่สำเร็จ");
    } finally {
      setLoadingAcc(false);
    }
  };

  // โหลดข้อมูลห้อง
  const fetchRoom = async (roomId: string) => {
    const res = await GetRoomById(roomId);
    if (res?.status !== 200) {
      throw new Error(res?.data?.error || "ไม่พบข้อมูลห้องพัก");
    }
    const raw = res.data?.data ?? res.data ?? {};
    const init: RoomForm = {
      Name: pick(raw.Name, raw.name),
      Type: pick(raw.Type, raw.type),
      BedType: pick(raw.BedType, raw.bed_type),
      People: Number(pick(raw.People, raw.people) ?? 1),
      Price: Number(pick(raw.Price, raw.price) ?? 0),
      Status: pick(raw.Status, raw.status),
      AccommodationID: Number(
        pick(raw.AccommodationID, raw.accommodation_id, raw?.Accommodation?.ID)
      ) || undefined,
    };
    form.setFieldsValue(init);
  };

  useEffect(() => {
    (async () => {
      try {
        await fetchAccommodations(); // ให้ options พร้อมก่อน
        if (id) await fetchRoom(id);
      } catch (e: any) {
        messageApi.error(e?.message || "โหลดข้อมูลไม่สำเร็จ");
        setTimeout(() => navigate("/accommodation/room"), 1000);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onFinish = async (values: RoomForm) => {
    try {
      setSaving(true);

      // ส่งสองรูปแบบคีย์ (กันกรณี backend ตั้ง tag ไม่ตรง)
      const payload = {
        // PascalCase
        Name: values.Name,
        Type: values.Type,
        BedType: values.BedType,
        People: values.People,
        Price: values.Price,
        Status: values.Status,
        AccommodationID: values.AccommodationID,

        // snake_case (ตรง json tag ของ struct Room ที่คุณใช้)
        name: values.Name,
        type: values.Type,
        bed_type: values.BedType,
        people: values.People,
        price: values.Price,
        status: values.Status,
        accommodation_id: values.AccommodationID,
      };

      const res = await UpdateRoomById(String(id), payload);
      if (res?.status === 200) {
        messageApi.success(res?.data?.message ?? "บันทึกสำเร็จ");
        setTimeout(() => navigate("/accommodation/room"), 700);
      } else {
        throw new Error(res?.data?.error ?? "บันทึกไม่สำเร็จ");
      }
    } catch (e: any) {
      messageApi.error(e?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {contextHolder}
      <Card>
        <h2>แก้ไขข้อมูลห้องพัก</h2>
        <Divider />

        <Form<RoomForm>
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Row gutter={[16, 0]}>
            {/* ผูกกับที่พัก (แสดงชื่อที่พัก) */}
            <Col xs={24} md={12}>
              <Form.Item
                label="สถานที่พัก"
                name="AccommodationID"
                rules={[{ required: true, message: "กรุณาเลือกสถานที่พัก !" }]}
              >
                <Select
                  placeholder="เลือกที่พัก"
                  allowClear
                  showSearch
                  loading={loadingAcc}
                  optionFilterProp="label"
                  optionLabelProp="label"
                  filterOption={(input, option) =>
                    (option?.label as string)
                      ?.toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={(accommodations ?? []).map((a) => ({
                    value: Number(a.ID),
                    label: a.Name || `ที่พัก #${a.ID}`,
                  }))}
                />
              </Form.Item>
            </Col>

            {/* ชื่อห้อง */}
            <Col xs={24} md={12}>
              <Form.Item
                label="ชื่อห้องพัก"
                name="Name"
                rules={[{ required: true, message: "กรุณากรอกชื่อห้องพัก !" }]}
              >
                <Input placeholder="เช่น ห้อง 101 / Deluxe 1" />
              </Form.Item>
            </Col>

            {/* ลักษณะห้อง */}
            <Col xs={24} md={12}>
              <Form.Item
                label="ลักษณะห้อง"
                name="Type"
                rules={[{ required: true, message: "กรุณาเลือกลักษณะห้อง !" }]}
              >
                <Select
                  placeholder="เลือกประเภทห้อง"
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  options={ROOM_TYPES}
                />
              </Form.Item>
            </Col>

            {/* ลักษณะเตียง */}
            <Col xs={24} md={12}>
              <Form.Item
                label="ลักษณะเตียง"
                name="BedType"
                rules={[{ required: true, message: "กรุณาเลือกลักษณะเตียง !" }]}
              >
                <Select
                  placeholder="เลือกประเภทเตียง"
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  options={BED_TYPES}
                />
              </Form.Item>
            </Col>

            {/* ราคา */}
            <Col xs={24} md={12}>
              <Form.Item
                label="ราคา (บาท/คืน)"
                name="Price"
                rules={[{ required: true, message: "กรุณาระบุราคา !" }]}
              >
                <InputNumber
                  min={0}
                  step={100}
                  style={{ width: "100%" }}
                  placeholder="เช่น 1200"
                />
              </Form.Item>
            </Col>

            {/* จำนวนคนพักได้ */}
            <Col xs={24} md={12}>
              <Form.Item
                label="จำนวนคนพักได้"
                name="People"
                rules={[{ required: true, message: "กรุณาระบุจำนวนคน !" }]}
              >
                <InputNumber
                  min={1}
                  max={10}
                  style={{ width: "100%" }}
                  placeholder="เช่น 2"
                />
              </Form.Item>
            </Col>

            {/* สถานะห้อง */}
            <Col xs={24} md={12}>
              <Form.Item
                label="สถานะห้องพัก"
                name="Status"
                rules={[{ required: true, message: "กรุณาเลือกสถานะห้องพัก !" }]}
              >
                <Select
                  placeholder="เลือกสถานะห้องพัก"
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  options={ROOM_STATUS}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* ปุ่ม */}
          <Row justify="end">
            <Col style={{ marginTop: 32 }}>
              <Form.Item>
                <Space>
                  <Link to="/accommodation/room">
                    <Button htmlType="button">ยกเลิก</Button>
                  </Link>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<PlusOutlined />}
                    loading={saving}
                  >
                    บันทึก
                  </Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
}

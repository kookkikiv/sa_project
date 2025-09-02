// src/pages/Room/create/index.tsx
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
  Alert,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";

import { type RoomInterface } from "../../../interface/Room";
import { CreateRoom, GetAccommodation } from "../../../services/https";

// รับเฉพาะฟิลด์ที่ใช้ใน select
type AccommodationLite = { ID: number; Name?: string };

// กัน response ที่บางทีห่อ data/items มา
const asArray = <T,>(val: any): T[] =>
  Array.isArray(val) ? (val as T[])
  : Array.isArray(val?.data) ? (val.data as T[])
  : Array.isArray(val?.items) ? (val.items as T[])
  : [];

function RoomCreate() {
  const navigate = useNavigate();
  const [form] = Form.useForm<RoomInterface>();
  const [messageApi, contextHolder] = message.useMessage();

  const [accommodations, setAccommodations] = useState<AccommodationLite[]>([]);
  const [loadingAcc, setLoadingAcc] = useState(false);

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

  // โหลดรายชื่อ "ที่พัก" มาให้เลือก
  const fetchAccommodations = async () => {
    setLoadingAcc(true);
    try {
      const res = await GetAccommodation();
      const list = asArray<AccommodationLite>(res?.data);
      setAccommodations(list);
      if (!Array.isArray(list) || list.length === 0) {
        messageApi.info("ยังไม่มีข้อมูลที่พัก ให้เพิ่มที่พักก่อนสร้างห้องนะ");
      }
    } catch {
      setAccommodations([]);
      messageApi.error("โหลดรายชื่อที่พักไม่สำเร็จ");
    } finally {
      setLoadingAcc(false);
    }
  };

  // ส่งฟอร์ม
  const onFinish = async (values: RoomInterface) => {
    try {
      const adminId = localStorage.getItem("id");
      const payload = {
        Name: values.Name,
        Type: values.Type,                   // "standard" | "suite" | "family"
        BedType: values.BedType,             // "single" | "double" | ...
        Price: values.Price,                 // number
        People: values.People,               // number
        Status: values.Status,               // "open" | "closed"
        AccommodationID: values.AccommodationID, // ✅ ผูกกับที่พัก
        AdminID: adminId ? parseInt(adminId, 10) : undefined,
      };

      const res = await CreateRoom(payload);
      if (res?.status === 200 || res?.status === 201) {
        messageApi.success(res?.data?.message ?? "บันทึกสำเร็จ");
        navigate("/room");
      } else {
        messageApi.error(res?.data?.error ?? "บันทึกไม่สำเร็จ");
      }
    } catch {
      messageApi.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  useEffect(() => {
    void fetchAccommodations();
  }, []);

  return (
    <div>
      {contextHolder}
      <Card>
        <h2>เพิ่มข้อมูลห้องพัก</h2>
        <Divider />

        {accommodations.length === 0 && (
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
            message="ยังไม่มีข้อมูลที่พัก"
            description={
              <>
                กรุณาไปที่เมนู “ที่พัก” เพื่อสร้างที่พักก่อน แล้วค่อยกลับมาสร้างห้อง
              </>
            }
          />
        )}

        <Form
          form={form}
          name="room-create"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          initialValues={{ People: 2, Status: "open" }}
        >
          <Row gutter={[16, 0]}>
            {/* ผูกกับที่พัก */}
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
                  options={(accommodations ?? []).map((a) => ({
                    value: Number(a.ID),
                    label: a.Name || `ที่พัก #${a.ID}`,
                  }))}
                />
              </Form.Item>
            </Col>

            {/* ชื่อห้องพัก */}
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
                <InputNumber min={0} step={100} style={{ width: "100%" }} placeholder="เช่น 1200" />
              </Form.Item>
            </Col>

            {/* จำนวนคนพักได้ */}
            <Col xs={24} md={12}>
              <Form.Item
                label="จำนวนคนพักได้"
                name="People"
                rules={[{ required: true, message: "กรุณาระบุจำนวนคน !" }]}
              >
                <InputNumber min={1} max={10} style={{ width: "100%" }} placeholder="เช่น 2" />
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
                  <Link to="/room">
                    <Button htmlType="button">ยกเลิก</Button>
                  </Link>
                  <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
                    ยืนยัน
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

export default RoomCreate;

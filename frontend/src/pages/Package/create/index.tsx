// src/page/Accommodation/create.tsx
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
  DatePicker,
} from "antd";
import { useState, useEffect } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import { Dayjs } from "dayjs";

import {
  GetProvince,
  GetDistrict,
  GetSubdistrict,
  CreatePackage,
} from "../../../services/https";

// ---------- ประเภทข้อมูลสถานที่ ----------
type BaseLoc = {
  ID: number | string;
  districtNameTh?: string;
  districtNameEn?: string;
  provinceNameTh?: string; provinceNameEn?: string;
  subdistrictNameTh?: string; subdistrictNameEn?: string;
  Name?: string; NameTh?: string; NameEn?: string; NameEN?: string;
  ProvinceName?: string; province_name?: string;
  DistrictName?: string; district_name?: string;
  SubdistrictName?: string; subdistrict_name?: string;
};

type Province = BaseLoc;
type District = BaseLoc & { ProvinceID?: number };
type Subdistrict = BaseLoc & { DistrictID?: number };

// ---------- ฟอร์มแพ็กเกจ (ตรงกับ PackageInterface) ----------
type PackageForm = {
  ID?: number;
  name?: string;
  people?: number;
  start_date?: Dayjs;   // ใช้ Dayjs ในฟอร์ม แล้วค่อย format เป็น string ตอนส่ง
  final_date?: Dayjs;
  price?: number;
  guide_id?: number;
  province_id?: number;
  district_id?: number;
  subdistrict_id?: number;
  admin_id?: number;
};

// ---------- helpers ----------
const getDisplayName = (o: BaseLoc) =>
  o?.districtNameTh || o?.districtNameEn ||
  o?.provinceNameTh || o?.provinceNameEn ||
  o?.subdistrictNameTh || o?.subdistrictNameEn ||
  o?.NameTh || o?.NameEN || o?.NameEn || o?.Name ||
  o?.ProvinceName || o?.province_name ||
  o?.DistrictName || o?.district_name ||
  o?.SubdistrictName || o?.subdistrict_name ||
  String(o?.ID ?? "");

const toOptions = (items: BaseLoc[]) =>
  (items ?? []).map((it) => ({
    value: Number(it.ID),
    label: getDisplayName(it),
  }));

// ป้องกันกรณี API ห่อ data/items
const asArray = <T,>(val: any): T[] =>
  Array.isArray(val) ? (val as T[]) :
  Array.isArray(val?.data) ? (val.data as T[]) :
  Array.isArray(val?.items) ? (val.items as T[]) :
  [];

export default function PackageCreate() {
  const navigate = useNavigate();
  const [form] = Form.useForm<PackageForm>();
  const [messageApi, contextHolder] = message.useMessage();

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [subdistricts, setSubdistricts] = useState<Subdistrict[]>([]);

  const [loadingProvince, setLoadingProvince] = useState(false);
  const [loadingDistrict, setLoadingDistrict] = useState(false);
  const [loadingSubdistrict, setLoadingSubdistrict] = useState(false);

  const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);

  // ------- Fetchers -------
  const fetchProvinces = async () => {
    setLoadingProvince(true);
    try {
      const res = await GetProvince();
      setProvinces(asArray<Province>(res?.data));
    } catch {
      setProvinces([]);
      messageApi.error("โหลดรายชื่อจังหวัดไม่สำเร็จ");
    } finally {
      setLoadingProvince(false);
    }
  };

  const fetchDistricts = async (provinceId: number) => {
    setLoadingDistrict(true);
    try {
      const res = await GetDistrict(provinceId);
      setDistricts(asArray<District>(res?.data));
    } catch {
      setDistricts([]);
      messageApi.error("โหลดรายชื่ออำเภอไม่สำเร็จ");
    } finally {
      setLoadingDistrict(false);
    }
  };

  const fetchSubdistricts = async (districtId: number) => {
    setLoadingSubdistrict(true);
    try {
      const res = await GetSubdistrict(districtId);
      setSubdistricts(asArray<Subdistrict>(res?.data));
    } catch {
      setSubdistricts([]);
      messageApi.error("โหลดรายชื่อตำบลไม่สำเร็จ");
    } finally {
      setLoadingSubdistrict(false);
    }
  };

  useEffect(() => {
    void fetchProvinces();
  }, []);

  // ------- Submit -------
  const onFinish = async (values: PackageForm) => {
    try {
      const adminId = localStorage.getItem("id");
      const payload = {
        name: values.name,
        people: values.people,
        start_date: values.start_date ? values.start_date.format("YYYY-MM-DD") : undefined,
        final_date: values.final_date ? values.final_date.format("YYYY-MM-DD") : undefined,
        price: values.price,
        guide_id: values.guide_id,
        province_id: values.province_id,
        district_id: values.district_id,
        subdistrict_id: values.subdistrict_id,
        admin_id: adminId ? parseInt(adminId, 10) : undefined,
      };

      const res = await CreatePackage(payload);
      if (res?.status === 200 || res?.status === 201) {
        messageApi.success(res?.data?.message ?? "บันทึกแพ็คเกจสำเร็จ");
        navigate("/package");
      } else {
        messageApi.error(res?.data?.error ?? "บันทึกไม่สำเร็จ");
      }
    } catch {
      messageApi.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  return (
    <div>
      {contextHolder}
      <Card>
        <h2>เพิ่มข้อมูลแพ็คเกจ</h2>
        <Divider />
        <Form
          form={form}
          name="package-create"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Row gutter={[16, 0]}>
            {/* ชื่อแพ็คเกจ */}
            <Col xs={24} md={12}>
              <Form.Item
                label="ชื่อแพ็คเกจ"
                name="name"
                rules={[{ required: true, message: "กรุณากรอกชื่อแพ็คเกจ !" }]}
              >
                <Input placeholder="เช่น เที่ยวกรุงเทพ" />
              </Form.Item>
            </Col>

            {/* จำนวนคน */}
            <Col xs={24} md={12}>
              <Form.Item
                label="จำนวนคน"
                name="people"
                rules={[{ required: true, message: "กรุณาระบุจำนวนคน !" }]}
              >
                <InputNumber min={1} style={{ width: "100%" }} placeholder="เช่น 4" />
              </Form.Item>
            </Col>

            {/* ราคา */}
            <Col xs={24} md={12}>
              <Form.Item
                label="ราคา (บาท)"
                name="price"
                rules={[{ required: true, message: "กรุณาระบุราคา !" }]}
              >
                <InputNumber min={0} style={{ width: "100%" }} placeholder="เช่น 3999" />
              </Form.Item>
            </Col>
            {/* กิจกรรม */}
            <Col xs={24} md={12}>
              <Form.Item
                label="กิจกรรม"
                name="event"
                rules={[{ required: true, message: "กรุณาระบุกิจกรรม !" }]}
              >
                <Select
                  placeholder="เลือกกิจกรรม"
                  allowClear
                  showSearch
                  loading={loadingProvince}
                  options={toOptions(provinces)}     // แสดงชื่อ เก็บเป็น ID (number)
                  optionFilterProp="label"
                  onChange={(value?: number) => {
                    // รีเซ็ตอำเภอ/ตำบลทุกครั้งที่เปลี่ยนจังหวัด
                    setSelectedProvince(value ?? null);
                    setSelectedDistrict(null);
                    setSubdistricts([]);
                    form.setFieldsValue({ district_id: undefined, subdistrict_id: undefined });
                    if (typeof value === "number") void fetchDistricts(value);
                    else setDistricts([]);
                  }}
                />
              </Form.Item>
            </Col>

            {/* ไกด์ไอดี (ถ้ายังไม่มีรายการไกด์ ให้ใส่เป็นเลขไอดี) */}
            <Col xs={24} md={12}>
              <Form.Item
                label="ไกด์ (guide_id)"
                name="guide_id"
                rules={[{ required: true, message: "กรุณาระบุไกด์ !" }]}
              >
                <Select
                  placeholder="เลือกไกด์"
                  allowClear
                  showSearch
                  loading={loadingProvince}
                  options={toOptions(provinces)}     // แสดงชื่อ เก็บเป็น ID (number)
                  optionFilterProp="label"
                  onChange={(value?: number) => {
                    // รีเซ็ตอำเภอ/ตำบลทุกครั้งที่เปลี่ยนจังหวัด
                    setSelectedProvince(value ?? null);
                    setSelectedDistrict(null);
                    setSubdistricts([]);
                    form.setFieldsValue({ district_id: undefined, subdistrict_id: undefined });
                    if (typeof value === "number") void fetchDistricts(value);
                    else setDistricts([]);
                  }}
                />
              </Form.Item>
            </Col>

            {/* วันที่เริ่มต้น */}
            <Col xs={24} md={12}>
              <Form.Item
                label="วันที่เริ่มต้น"
                name="start_date"
                rules={[{ required: true, message: "กรุณาเลือกวันที่เริ่มต้น !" }]}
              >
                <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>

            {/* วันที่สิ้นสุด */}
            <Col xs={24} md={12}>
              <Form.Item
                label="วันที่สิ้นสุด"
                name="final_date"
                rules={[{ required: true, message: "กรุณาเลือกวันที่สิ้นสุด !" }]}
              >
                <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>

            {/* จังหวัด */}
            <Col xs={24} md={12}>
              <Form.Item
                label="จังหวัด"
                name="province_id"
                rules={[{ required: true, message: "กรุณาเลือกจังหวัด !" }]}
              >
                <Select
                  placeholder="เลือกจังหวัด"
                  allowClear
                  showSearch
                  loading={loadingProvince}
                  options={toOptions(provinces)}     // แสดงชื่อ เก็บเป็น ID (number)
                  optionFilterProp="label"
                  onChange={(value?: number) => {
                    // รีเซ็ตอำเภอ/ตำบลทุกครั้งที่เปลี่ยนจังหวัด
                    setSelectedProvince(value ?? null);
                    setSelectedDistrict(null);
                    setSubdistricts([]);
                    form.setFieldsValue({ district_id: undefined, subdistrict_id: undefined });
                    if (typeof value === "number") void fetchDistricts(value);
                    else setDistricts([]);
                  }}
                />
              </Form.Item>
            </Col>

            {/* อำเภอ */}
            <Col xs={24} md={12}>
              <Form.Item
                label="อำเภอ"
                name="district_id"
                rules={[{ required: true, message: "กรุณาเลือกอำเภอ !" }]}
              >
                <Select
                  placeholder="เลือกอำเภอ"
                  allowClear
                  disabled={!selectedProvince}
                  showSearch
                  loading={loadingDistrict}
                  options={toOptions(districts)}
                  optionFilterProp="label"
                  onChange={(value?: number) => {
                    // รีเซ็ตตำบลเมื่อเปลี่ยนอำเภอ
                    setSelectedDistrict(value ?? null);
                    form.setFieldsValue({ subdistrict_id: undefined });
                    if (typeof value === "number") void fetchSubdistricts(value);
                    else setSubdistricts([]);
                  }}
                />
              </Form.Item>
            </Col>

            {/* ตำบล */}
            <Col xs={24} md={12}>
              <Form.Item
                label="ตำบล"
                name="subdistrict_id"
                rules={[{ required: true, message: "กรุณาเลือกตำบล !" }]}
              >
                <Select
                  placeholder="เลือกตำบล"
                  allowClear
                  disabled={!selectedDistrict}
                  showSearch
                  loading={loadingSubdistrict}
                  options={toOptions(subdistricts)}
                  optionFilterProp="label"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* ปุ่ม */}
          <Row justify="end">
            <Col style={{ marginTop: 32 }}>
              <Form.Item>
                <Space>
                  <Link to="/package">
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

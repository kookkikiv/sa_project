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
} from "antd";
import { useState, useEffect } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";

import {
  GetProvince,
  GetDistrict,
  GetSubdistrict,
  CreateAccommodation,
} from "../../../services/https";

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

type AccommodationForm = {
  Name?: string;
  Type?: string;
  Status?: string;
  ProvinceID?: number;
  DistrictID?: number;
  SubdistrictID?: number;
};

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

// --- ป้องกันกรณี API ห่อ data/ items ---
const asArray = <T,>(val: any): T[] =>
  Array.isArray(val) ? (val as T[]) :
  Array.isArray(val?.data) ? (val.data as T[]) :
  Array.isArray(val?.items) ? (val.items as T[]) :
  [];

export default function AccommodationCreate() {
  const navigate = useNavigate();
  const [form] = Form.useForm<AccommodationForm>();
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
  const onFinish = async (values: AccommodationForm) => {
    try {
      const adminId = localStorage.getItem("id");
      const payload = {
        Name: values.Name,
        Type: values.Type,
        Status: values.Status,
        ProvinceID: values.ProvinceID,
        DistrictID: values.DistrictID,
        SubdistrictID: values.SubdistrictID,
        AdminID: adminId ? parseInt(adminId, 10) : undefined,
      };

      const res = await CreateAccommodation(payload);
      if (res?.status === 200 || res?.status === 201) {
        messageApi.success(res?.data?.message ?? "บันทึกที่พักสำเร็จ");
        navigate("/accommodation");
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
        <h2>เพิ่มข้อมูลที่พัก</h2>
        <Divider />
        <Form
          form={form}
          name="accommodation-create"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Row gutter={[16, 0]}>
            {/* ชื่อที่พัก */}
            <Col xs={24} md={12}>
              <Form.Item
                label="ชื่อที่พัก"
                name="Name"
                rules={[{ required: true, message: "กรุณากรอกชื่อที่พัก !" }]}
              >
                <Input placeholder="เช่น โรงแรม ABC" />
              </Form.Item>
            </Col>

            {/* ลักษณะที่พัก */}
            <Col xs={24} md={12}>
              <Form.Item
                label="ลักษณะที่พัก"
                name="Type"
                rules={[{ required: true, message: "กรุณาเลือกลักษณะที่พัก !" }]}
              >
                <Select
                  placeholder="เลือกประเภทที่พัก"
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  options={[
                    { value: "hotel",  label: "โรงแรม" },
                    { value: "resort", label: "รีสอร์ท" },
                    { value: "hostel", label: "โฮสเทล" },
                  ]}
                />
              </Form.Item>
            </Col>

            {/* สถานะที่พัก */}
            <Col xs={24} md={12}>
              <Form.Item
                label="สถานะที่พัก"
                name="Status"
                rules={[{ required: true, message: "กรุณาเลือกสถานะที่พัก !" }]}
              >
                <Select
                  placeholder="เลือกสถานะ"
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  options={[
                    { value: "open",   label: "เปิดให้บริการ" },
                    { value: "closed", label: "ปิดปรับปรุง" },
                  ]}
                />
              </Form.Item>
            </Col>

            {/* จังหวัด */}
            <Col xs={24} md={12}>
              <Form.Item
                label="จังหวัด"
                name="ProvinceID"
                rules={[{ required: true, message: "กรุณาเลือกจังหวัด !" }]}
              >
                <Select
                  placeholder="เลือกจังหวัด"
                  allowClear
                  showSearch
                  loading={loadingProvince}
                  options={toOptions(provinces)}     // แสดงชื่อ เก็บเป็น ID
                  optionFilterProp="label"
                  onChange={(value?: number) => {
                    // รีเซ็ตอำเภอ/ตำบลทุกครั้งที่เปลี่ยนจังหวัด
                    setSelectedProvince(value ?? null);
                    setSelectedDistrict(null);
                    setSubdistricts([]);
                    form.setFieldsValue({ DistrictID: undefined, SubdistrictID: undefined });
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
                name="DistrictID"
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
                    form.setFieldsValue({ SubdistrictID: undefined });
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
                name="SubdistrictID"
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
                  <Link to="/accommodation">
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

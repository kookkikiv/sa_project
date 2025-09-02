// src/pages/Package/edit/index.tsx
import { useState, useEffect } from "react";
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
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate, Link, useParams } from "react-router-dom";
import dayjs, { Dayjs } from "dayjs";

import {
  GetProvince,
  GetDistrict,
  GetSubdistrict,
  GetPackageById,
  UpdatePackageById,
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

// ---------- ฟอร์มแพ็กเกจ (ให้ตรงกับ PackageInterface) ----------
type PackageForm = {
  ID?: number;
  name?: string;
  people?: number;
  start_date?: Dayjs;     // ในฟอร์มใช้ Dayjs
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

const asArray = <T,>(val: any): T[] =>
  Array.isArray(val) ? (val as T[])
  : Array.isArray(val?.data) ? (val.data as T[])
  : Array.isArray(val?.items) ? (val.items as T[])
  : [];

export default function PackageEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm<PackageForm>();
  const [messageApi, contextHolder] = message.useMessage();

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [subdistricts, setSubdistricts] = useState<Subdistrict[]>([]);

  const [loadingProvince, setLoadingProvince] = useState(false);
  const [loadingDistrict, setLoadingDistrict] = useState(false);
  const [loadingSubdistrict, setLoadingSubdistrict] = useState(false);
  const [saving, setSaving] = useState(false);

  // watch ค่าที่เลือก เพื่อคุม disable ของ select ลูก
  const provinceIdWatch = Form.useWatch<number | undefined>("province_id", form);
  const districtIdWatch  = Form.useWatch<number | undefined>("district_id", form);

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

  // ดึงข้อมูลเดิมของแพ็กเกจ
  const loadPackage = async (pkgId: string) => {
    const res = await GetPackageById(pkgId);
    if (res?.status !== 200) throw new Error(res?.data?.error ?? "ไม่พบข้อมูลแพ็กเกจ");

    const d = res.data || {};
    const init: PackageForm = {
      ID: d.ID,
      name: d.name ?? d.Name,
      people: d.people ?? d.People,
      start_date: d.start_date ? dayjs(d.start_date) : (d.StartDate ? dayjs(d.StartDate) : undefined),
      final_date: d.final_date ? dayjs(d.final_date) : (d.FinalDate ? dayjs(d.FinalDate) : undefined),
      price: d.price ?? d.Price,
      guide_id: d.guide_id ?? d.GuideID,
      province_id: d.province_id ?? d.ProvinceID,
      district_id: d.district_id ?? d.DistrictID,
      subdistrict_id: d.subdistrict_id ?? d.SubdistrictID,
      admin_id: d.admin_id ?? d.AdminID,
    };
    return init;
  };

  // ------- Init: โหลดตามลำดับ -------
  useEffect(() => {
    (async () => {
      try {
        await fetchProvinces();          // 1) ให้จังหวัดพร้อมก่อน
        const init = await loadPackage(id!); // 2) โหลดข้อมูลเดิม

        // 3) โหลดอำเภอ/ตำบลตามค่าเดิม
        if (init.province_id) await fetchDistricts(Number(init.province_id));
        if (init.district_id) await fetchSubdistricts(Number(init.district_id));

        // 4) set ค่าเข้าฟอร์มหลัง options พร้อมแล้ว
        form.setFieldsValue(init);
      } catch (e: any) {
        messageApi.error(e?.message || "โหลดข้อมูลไม่สำเร็จ");
        setTimeout(() => navigate("/package"), 1200);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ------- Submit -------
  const onFinish = async (values: PackageForm) => {
    try {
      setSaving(true);
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
        admin_id: adminId ? parseInt(adminId, 10) : values.admin_id,
      };

      const res = await UpdatePackageById(id!, payload);
      if (res?.status === 200) {
        messageApi.success(res?.data?.message ?? "บันทึกสำเร็จ");
        setTimeout(() => navigate("/package"), 800);
      } else {
        throw new Error(res?.data?.error ?? "บันทึกไม่สำเร็จ");
      }
    } catch (e: any) {
      messageApi.error(e?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setSaving(false);
    }
  };

  // ------- UI -------
  return (
    <div>
      {contextHolder}
      <Card>
        <h2>แก้ไขข้อมูลแพ็คเกจ</h2>
        <Divider />

        <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
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

            {/* ไกด์ */}
            <Col xs={24} md={12}>
              <Form.Item
                label="ไกด์ (guide_id)"
                name="guide_id"
                rules={[{ required: true, message: "กรุณาระบุไกด์ !" }]}
              >
                <InputNumber min={1} style={{ width: "100%" }} placeholder="เช่น 1" />
              </Form.Item>
            </Col>

            {/* วันเริ่ม - วันสิ้นสุด */}
            <Col xs={24} md={12}>
              <Form.Item
                label="วันที่เริ่มต้น"
                name="start_date"
                rules={[{ required: true, message: "กรุณาเลือกวันที่เริ่มต้น !" }]}
              >
                <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>

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
                  options={toOptions(provinces)}
                  optionFilterProp="label"
                  onChange={async (value?: number) => {
                    // รีเซ็ตอำเภอ/ตำบลเมื่อเปลี่ยนจังหวัด
                    form.setFieldsValue({ district_id: undefined, subdistrict_id: undefined });
                    setSubdistricts([]);
                    if (typeof value === "number") await fetchDistricts(value);
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
                  disabled={!provinceIdWatch}
                  showSearch
                  loading={loadingDistrict}
                  options={toOptions(districts)}
                  optionFilterProp="label"
                  onChange={async (value?: number) => {
                    form.setFieldsValue({ subdistrict_id: undefined });
                    if (typeof value === "number") await fetchSubdistricts(value);
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
                  disabled={!districtIdWatch}
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
                  <Button type="primary" htmlType="submit" icon={<PlusOutlined />} loading={saving}>
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

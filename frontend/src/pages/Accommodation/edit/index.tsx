import { useEffect, useState } from "react";
import {
  Form, Input, Select, Button, Card, Row, Col, Divider, Space, message,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  GetProvince,
  GetDistrict,
  GetSubdistrict,
  GetAccommodationById,
  UpdateAccommodationById,
} from "../../../services/https";

// ----- helpers -----
const asArray = <T,>(v: any): T[] =>
  Array.isArray(v) ? v as T[] :
  Array.isArray(v?.data) ? v.data as T[] :
  Array.isArray(v?.items) ? v.items as T[] : [];

const labelProvince = (p: any) =>
  p?.provinceNameTh || p?.provinceNameEn || p?.NameTh || p?.NameEn || p?.name || String(p?.ID ?? "");
const labelDistrict = (d: any) =>
  d?.districtNameTh || d?.districtNameEn || d?.NameTh || d?.NameEn || d?.name || String(d?.ID ?? "");
const labelSubdistrict = (s: any) =>
  s?.subdistrictNameTh || s?.subdistrictNameEn || s?.NameTh || s?.NameEn || s?.name || String(s?.ID ?? "");

export default function AccommodationEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [msg, ctx] = message.useMessage();

  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [subdistricts, setSubdistricts] = useState<any[]>([]);

  const [loadingProvince, setLoadingProvince] = useState(false);
  const [loadingDistrict, setLoadingDistrict] = useState(false);
  const [loadingSubdistrict, setLoadingSubdistrict] = useState(false);
  const [saving, setSaving] = useState(false);

  // ดูค่าที่เลือกจากฟอร์ม (ไม่ต้องทำ state แยก)
  const provinceId: number | undefined = Form.useWatch("province_id", form);
  const districtId: number | undefined = Form.useWatch("district_id", form);

  // ----- loaders -----
  const loadProvinces = async () => {
    setLoadingProvince(true);
    try {
      const res = await GetProvince();
      setProvinces(asArray(res?.data));
    } catch {
      setProvinces([]);
      msg.error("โหลดจังหวัดไม่สำเร็จ");
    } finally {
      setLoadingProvince(false);
    }
  };

  const loadDistricts = async (pid: number) => {
    setLoadingDistrict(true);
    try {
      const res = await GetDistrict(pid);
      setDistricts(asArray(res?.data));
    } catch {
      setDistricts([]);
      msg.error("โหลดอำเภอไม่สำเร็จ");
    } finally {
      setLoadingDistrict(false);
    }
  };

  const loadSubdistricts = async (did: number) => {
    setLoadingSubdistrict(true);
    try {
      const res = await GetSubdistrict(did);
      setSubdistricts(asArray(res?.data));
    } catch {
      setSubdistricts([]);
      msg.error("โหลดตำบลไม่สำเร็จ");
    } finally {
      setLoadingSubdistrict(false);
    }
  };

  // แรกเข้า: โหลดจังหวัด แล้วดึงข้อมูลที่พักมาใส่ฟอร์ม
  useEffect(() => {
    (async () => {
      try {
        await loadProvinces();

        const res = await GetAccommodationById(String(id));
        if (res?.status !== 200) throw new Error("ไม่พบข้อมูลที่พัก");

        // backend ส่งเป็น snake_case ตรงกับ json tag
        const data = res.data;

        // ใส่ค่าเริ่มต้น (ใช้เลขตรงๆ ไม่ต้องแปลง string)
        form.setFieldsValue({
          name: data.name ?? data.Name,
          type: data.type ?? data.Type,
          status: data.status ?? data.Status,
          province_id: data.province_id ?? data.ProvinceID,
          district_id: data.district_id ?? data.DistrictID,
          subdistrict_id: data.subdistrict_id ?? data.SubdistrictID,
        });

        if (data.province_id ?? data.ProvinceID) {
          await loadDistricts(Number(data.province_id ?? data.ProvinceID));
        }
        if (data.district_id ?? data.DistrictID) {
          await loadSubdistricts(Number(data.district_id ?? data.DistrictID));
        }
      } catch (e: any) {
        msg.error(e?.message || "เกิดข้อผิดพลาด");
        setTimeout(() => navigate("/accommodation"), 1200);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // เมื่อเลือกจังหวัด → โหลดอำเภอใหม่ และล้างค่าอำเภอ/ตำบล
  useEffect(() => {
    (async () => {
      if (typeof provinceId === "number") {
        form.setFieldsValue({ district_id: undefined, subdistrict_id: undefined });
        setSubdistricts([]);
        await loadDistricts(provinceId);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provinceId]);

  // เมื่อเลือกอำเภอ → โหลดตำบลใหม่ และล้างค่าตำบล
  useEffect(() => {
    (async () => {
      if (typeof districtId === "number") {
        form.setFieldsValue({ subdistrict_id: undefined });
        await loadSubdistricts(districtId);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [districtId]);

  // ----- submit -----
  const onFinish = async (values: {
    name?: string; type?: string; status?: string;
    province_id?: number; district_id?: number; subdistrict_id?: number;
  }) => {
    try {
      setSaving(true);
      const adminId = localStorage.getItem("id");

      // ส่งเป็น snake_case ให้ตรงกับฝั่ง Go
      const payload = {
        name: values.name,
        type: values.type,
        status: values.status,
        province_id: values.province_id,
        district_id: values.district_id,
        subdistrict_id: values.subdistrict_id,
        admin_id: adminId ? Number(adminId) : undefined,
      };

      const res = await UpdateAccommodationById(String(id),payload);
      if (res?.status === 200) {
        msg.success(res?.data?.message ?? "บันทึกสำเร็จ");
        setTimeout(() => navigate("/accommodation"), 800);
      } else {
        throw new Error(res?.data?.error ?? "บันทึกไม่สำเร็จ");
      }
    } catch (e: any) {
      msg.error(e?.message || "เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {ctx}
      <Card>
        <h2>แก้ไขข้อมูลที่พัก</h2>
        <Divider />

        <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                label="ชื่อที่พัก"
                name="name"
                rules={[{ required: true, message: "กรุณากรอกชื่อที่พัก !" }]}
              >
                <Input placeholder="เช่น โรงแรม ABC" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="ลักษณะที่พัก"
                name="type"
                rules={[{ required: true, message: "กรุณาเลือกลักษณะที่พัก !" }]}
              >
                <Select
                  placeholder="เลือกประเภทที่พัก"
                  options={[
                    { value: "hotel", label: "โรงแรม" },
                    { value: "resort", label: "รีสอร์ท" },
                    { value: "hostel", label: "โฮสเทล" },
                  ]}
                  showSearch
                  optionFilterProp="label"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="สถานะที่พัก"
                name="status"
                rules={[{ required: true, message: "กรุณาเลือกสถานะที่พัก !" }]}
              >
                <Select
                  placeholder="เลือกสถานะ"
                  options={[
                    { value: "open", label: "เปิดให้บริการ" },
                    { value: "closed", label: "ปิดปรับปรุง" },
                  ]}
                  showSearch
                  optionFilterProp="label"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="จังหวัด"
                name="province_id"
                rules={[{ required: true, message: "กรุณาเลือกจังหวัด !" }]}
              >
                <Select
                  placeholder="เลือกจังหวัด"
                  loading={loadingProvince}
                  options={provinces.map((p) => ({ value: p.ID, label: labelProvince(p) }))}
                  showSearch
                  optionFilterProp="label"
                  allowClear
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="อำเภอ"
                name="district_id"
                rules={[{ required: true, message: "กรุณาเลือกอำเภอ !" }]}
              >
                <Select
                  placeholder="เลือกอำเภอ"
                  loading={loadingDistrict}
                  disabled={!provinceId}
                  options={districts.map((d) => ({ value: d.ID, label: labelDistrict(d) }))}
                  showSearch
                  optionFilterProp="label"
                  allowClear
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="ตำบล"
                name="subdistrict_id"
                rules={[{ required: true, message: "กรุณาเลือกตำบล !" }]}
              >
                <Select
                  placeholder="เลือกตำบล"
                  loading={loadingSubdistrict}
                  disabled={!districtId}
                  options={subdistricts.map((s) => ({ value: s.ID, label: labelSubdistrict(s) }))}
                  showSearch
                  optionFilterProp="label"
                  allowClear
                />
              </Form.Item>
            </Col>
          </Row>

          <Row justify="end">
            <Col style={{ marginTop: 32 }}>
              <Form.Item>
                <Space>
                  <Link to="/accommodation">
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

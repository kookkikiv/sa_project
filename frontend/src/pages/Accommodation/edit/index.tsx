// src/pages/Accommodation/edit/index.tsx
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
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate, Link, useParams } from "react-router-dom";

import { type AccommodationInterface } from "../../../interface/Accommodation";
import { type ProvinceInterface } from "../../../interface/Province";
import { type DistrictInterface } from "../../../interface/District";
import { type SubdistrictInterface } from "../../../interface/Subdistrict";

import {
  GetProvince,
  GetDistrict,
  GetSubdistrict,
  GetAccommodationById,
  UpdateAccommodationById,
} from "../../../services/https";

// ---------------- helpers: แปลงเป็น options + ดึง label ----------------
const provinceOptions = (items: ProvinceInterface[]) =>
  (items ?? []).map((p) => ({
    value: String(p.ID),
    label:
      (p as any).provinceNameTh ||
      (p as any).provinceNameEn ||
      (p as any).NameTh ||
      (p as any).NameEn ||
      String(p.ID),
  }));

const districtOptions = (items: DistrictInterface[]) =>
  (items ?? []).map((d) => ({
    value: String(d.ID),
    label:
      (d as any).districtNameTh ||
      (d as any).districtNameEn ||
      (d as any).NameTh ||
      (d as any).NameEn ||
      String(d.ID),
  }));

const subdistrictOptions = (items: SubdistrictInterface[]) =>
  (items ?? []).map((s) => ({
    value: String(s.ID),
    label:
      (s as any).subdistrictNameTh ||
      (s as any).subdistrictNameEn ||
      (s as any).NameTh ||
      (s as any).NameEn ||
      String(s.ID),
  }));

// ป้องกันกรณี API ห่อ data/items
const asArray = <T,>(val: any): T[] =>
  Array.isArray(val) ? (val as T[]) :
  Array.isArray(val?.data) ? (val.data as T[]) :
  Array.isArray(val?.items) ? (val.items as T[]) :
  [];

export default function AccommodationEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const [provinces, setProvinces] = useState<ProvinceInterface[]>([]);
  const [districts, setDistricts] = useState<DistrictInterface[]>([]);
  const [subdistricts, setSubdistricts] = useState<SubdistrictInterface[]>([]);

  const [selectedProvinceStr, setSelectedProvinceStr] = useState<string | null>(null);
  const [selectedDistrictStr, setSelectedDistrictStr] = useState<string | null>(null);

  const [loadingProvince, setLoadingProvince] = useState(false);
  const [loadingDistrict, setLoadingDistrict] = useState(false);
  const [loadingSubdistrict, setLoadingSubdistrict] = useState(false);
  const [saving, setSaving] = useState(false);

  // ---------------- Fetchers ----------------
  const onGetProvince = async () => {
    setLoadingProvince(true);
    try {
      const res = await GetProvince();
      if (res?.status === 200) setProvinces(asArray<ProvinceInterface>(res.data));
      else throw new Error();
    } catch {
      setProvinces([]);
      messageApi.error("ไม่พบข้อมูลจังหวัด");
      setTimeout(() => navigate("/accommodation"), 1500);
    } finally {
      setLoadingProvince(false);
    }
  };

  const onGetDistrict = async (provinceId: number) => {
    setLoadingDistrict(true);
    try {
      const res = await GetDistrict(provinceId);
      if (res?.status === 200) setDistricts(asArray<DistrictInterface>(res.data));
      else throw new Error();
    } catch {
      setDistricts([]);
      messageApi.error("ไม่พบข้อมูลอำเภอ");
    } finally {
      setLoadingDistrict(false);
    }
  };

  const onGetSubdistrict = async (districtId: number) => {
    setLoadingSubdistrict(true);
    try {
      const res = await GetSubdistrict(districtId);
      if (res?.status === 200) setSubdistricts(asArray<SubdistrictInterface>(res.data));
      else throw new Error();
    } catch {
      setSubdistricts([]);
      messageApi.error("ไม่พบข้อมูลตำบล");
    } finally {
      setLoadingSubdistrict(false);
    }
  };

  const getAccommodationById = async (accId: string) => {
    const res = await GetAccommodationById(accId);
    if (res?.status !== 200) throw new Error("ไม่พบข้อมูลที่พัก");

    const data = res.data;
    // แปลงเป็น string ให้ตรงกับ Select.value
    const pidStr = data.ProvinceID != null ? String(data.ProvinceID) : undefined;
    const didStr = data.DistrictID != null ? String(data.DistrictID) : undefined;
    const sidStr = data.SubdistrictID != null ? String(data.SubdistrictID) : undefined;

    return {
      Name: data.Name,
      Type: data.Type,
      Status: data.Status,
      ProvinceID: pidStr,
      DistrictID: didStr,
      SubdistrictID: sidStr,
    } as {
      Name?: string;
      Type?: string;
      Status?: string;
      ProvinceID?: string;
      DistrictID?: string;
      SubdistrictID?: string;
    };
  };

  // ---------------- Init: โหลดตามลำดับ ----------------
  useEffect(() => {
    (async () => {
      try {
        await onGetProvince();                 // 1) provinces พร้อมก่อน
        const init = await getAccommodationById(id!); // 2) ดึงข้อมูลเดิม

        // 3) โหลด districts/subdistricts ตามค่าเดิม
        if (init.ProvinceID) {
          setSelectedProvinceStr(init.ProvinceID);
          await onGetDistrict(Number(init.ProvinceID));
        }
        if (init.DistrictID) {
          setSelectedDistrictStr(init.DistrictID);
          await onGetSubdistrict(Number(init.DistrictID));
        }

        // 4) set ค่าฟอร์มหลัง options พร้อมแล้ว → AntD หา label เจอ
        form.setFieldsValue(init);
      } catch (e: any) {
        messageApi.error(e?.message || "โหลดข้อมูลไม่สำเร็จ");
        setTimeout(() => navigate("/accommodation"), 1500);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ---------------- Submit ----------------
  const onFinish = async (values: AccommodationInterface & {
    ProvinceID?: string; DistrictID?: string; SubdistrictID?: string;
  }) => {
    try {
      setSaving(true);
      const adminId = localStorage.getItem("id");

      const payload = {
        Name: values.Name,
        Type: values.Type,
        Status: values.Status,
        ProvinceID: values.ProvinceID ? Number(values.ProvinceID) : undefined,
        DistrictID: values.DistrictID ? Number(values.DistrictID) : undefined,
        SubdistrictID: values.SubdistrictID ? Number(values.SubdistrictID) : undefined,
        AdminID: adminId ? parseInt(adminId, 10) : undefined,
      };

      const res = await UpdateAccommodationById(id!, payload);
      if (res?.status === 200) {
        messageApi.success(res?.data?.message ?? "บันทึกสำเร็จ");
        setTimeout(() => navigate("/accommodation"), 1000);
      } else {
        throw new Error(res?.data?.error ?? "บันทึกไม่สำเร็จ");
      }
    } catch (e: any) {
      messageApi.error(e?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setSaving(false);
    }
  };

  // ---------------- UI ----------------
  return (
    <div>
      {contextHolder}
      <Card>
        <h2>แก้ไขข้อมูล ที่พัก</h2>
        <Divider />

        <Form
          form={form}
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
                  placeholder="เลือกสถานะที่พัก"
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  options={[
                    { value: "open",   label: "เปิดใช้บริการ" },
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
                  options={provinceOptions(provinces)}
                  optionFilterProp="label"
                  value={selectedProvinceStr ?? undefined}
                  onChange={async (value?: string) => {
                    const v = value ?? null;
                    setSelectedProvinceStr(v);
                    setSelectedDistrictStr(null);
                    setSubdistricts([]);
                    // เคลียร์ค่าในฟอร์มลูก
                    form.setFieldsValue({ DistrictID: undefined, SubdistrictID: undefined });
                    if (v) await onGetDistrict(Number(v));
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
                  disabled={!selectedProvinceStr}
                  showSearch
                  loading={loadingDistrict}
                  options={districtOptions(districts)}
                  optionFilterProp="label"
                  value={selectedDistrictStr ?? undefined}
                  onChange={async (value?: string) => {
                    const v = value ?? null;
                    setSelectedDistrictStr(v);
                    form.setFieldsValue({ SubdistrictID: undefined });
                    if (v) await onGetSubdistrict(Number(v));
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
                  disabled={!selectedDistrictStr}
                  showSearch
                  loading={loadingSubdistrict}
                  options={subdistrictOptions(subdistricts)}
                  optionFilterProp="label"
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

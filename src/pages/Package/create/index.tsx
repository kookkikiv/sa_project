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
import { type PackageInterface } from "../../../interface/Package";
import { type ProvinceInterface } from "../../../interface/Province";
import { type DistrictInterface } from "../../../interface/District";
import { type SubdistrictInterface } from "../../../interface/Subdistrict";
import { type GuideInterface } from "../../../interface/Guide";
import {
  GetProvince,
  GetDistrict,
  GetSubdistrict,
  GetGuide,
  CreatePackage,
} from "../../../services/https";
import { useNavigate, Link } from "react-router-dom";


const { RangePicker } = DatePicker;

function PackageCreate() {
  const navigate = useNavigate();
  const [form] = Form.useForm<PackageInterface>();
  const [messageApi, contextHolder] = message.useMessage();

  const [province, setProvince] = useState<ProvinceInterface[]>([]);
  const [district, setDistrict] = useState<DistrictInterface[]>([]);
  const [subdistrict, setSubdistrict] = useState<SubdistrictInterface[]>([]);
  const [guides, setGuides] = useState<GuideInterface[]>([]);

  const [loadingProvince, setLoadingProvince] = useState(false);
  const [loadingDistrict, setLoadingDistrict] = useState(false);
  const [loadingSubdistrict, setLoadingSubdistrict] = useState(false);
  const [loadingGuides, setLoadingGuides] = useState(false);

  const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);

  // ---------- Helpers ----------
  const asArray = <T,>(val: any): T[] =>
    Array.isArray(val) ? (val as T[])
    : Array.isArray(val?.data) ? (val.data as T[])
    : Array.isArray(val?.items) ? (val.items as T[])
    : [];

  const getProvinceLabel = (p: any) =>
    p.NameTh || p.NameTH || p.ProvinceNameTh || p.ProvinceNameTH || p.Name || p.ThaiName || String(p.ID);

  const getDistrictLabel = (d: any) =>
    d.NameTh || d.NameTH || d.DistrictNameTh || d.DistrictNameTH || d.Name || d.ThaiName || String(d.ID);

  const getSubdistrictLabel = (s: any) =>
    s.NameTh || s.NameTH || s.SubdistrictNameTh || s.SubdistrictNameTH || s.Name || s.ThaiName || String(s.ID);

  const getGuideLabel = (g: any) =>
    g.Name || g.FullName || `${g.FirstName || ''} ${g.LastName || ''}`.trim() || String(g.ID);

  // ---------- Fetch ----------
  const onGetProvince = async () => {
    try {
      setLoadingProvince(true);
      const res = await GetProvince();
      if (res.status === 200) {
        setProvince(asArray<ProvinceInterface>(res.data));
      } else {
        setProvince([]);
        messageApi.error(res?.data?.error ?? "ไม่พบข้อมูลจังหวัด");
        navigate("/package");
      }
    } catch {
      setProvince([]);
      messageApi.error("เกิดข้อผิดพลาดในการโหลดจังหวัด");
      navigate("/package");
    } finally {
      setLoadingProvince(false);
    }
  };

  const onGetDistrict = async (provinceId: number) => {
    try {
      setLoadingDistrict(true);
      const res = await GetDistrict(provinceId);
      if (res.status === 200) {
        setDistrict(asArray<DistrictInterface>(res.data));
      } else {
        setDistrict([]);
        messageApi.error(res?.data?.error ?? "ไม่พบข้อมูลอำเภอ");
      }
    } catch {
      setDistrict([]);
      messageApi.error("เกิดข้อผิดพลาดในการโหลดอำเภอ");
    } finally {
      setLoadingDistrict(false);
    }
  };

  const onGetSubdistrict = async (districtId: number) => {
    try {
      setLoadingSubdistrict(true);
      const res = await GetSubdistrict(districtId);
      if (res.status === 200) {
        setSubdistrict(asArray<SubdistrictInterface>(res.data));
      } else {
        setSubdistrict([]);
        messageApi.error(res?.data?.error ?? "ไม่พบข้อมูลตำบล");
      }
    } catch {
      setSubdistrict([]);
      messageApi.error("เกิดข้อผิดพลาดในการโหลดตำบล");
    } finally {
      setLoadingSubdistrict(false);
    }
  };

  const onGetGuides = async () => {
    try {
      setLoadingGuides(true);
      const res = await GetGuide();
      if (res.status === 200) {
        setGuides(asArray<GuideInterface>(res.data));
      } else {
        setGuides([]);
        messageApi.error(res?.data?.error ?? "ไม่พบข้อมูลไกด์");
      }
    } catch {
      setGuides([]);
      messageApi.error("เกิดข้อผิดพลาดในการโหลดไกด์");
    } finally {
      setLoadingGuides(false);
    }
  };

  // ---------- Submit ----------
  const onFinish = async (values: any) => {
    try {
      const adminId = localStorage.getItem("id");
      const dateRange = values.DateRange;
      
      const payload = {
        Name: values.Name,
        People: values.People,
        StartDate: dateRange ? dateRange[0].format('YYYY-MM-DD') : undefined,
        FinalDate: dateRange ? dateRange[1].format('YYYY-MM-DD') : undefined,
        Price: values.Price,
        ProvinceID: values.ProvinceID,
        DistrictID: values.DistrictID,
        SubdistrictID: values.SubdistrictID,
        GuideID: values.GuideID,
        AdminID: adminId ? parseInt(adminId, 10) : undefined,
      };

      const res = await CreatePackage(payload);
      if (res.status === 201 || res.status === 200) {
        messageApi.success(res?.data?.message ?? "บันทึกสำเร็จ");
        navigate("/package");
      } else {
        messageApi.error(res?.data?.error ?? "บันทึกไม่สำเร็จ");
      }
    } catch {
      messageApi.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  useEffect(() => {
    void onGetProvince();
    void onGetGuides();
  }, []);

  // สร้าง options
  const provinceOptions = (Array.isArray(province) ? province : []).map((item: any) => ({
    label: getProvinceLabel(item),
    value: item.ID as number,
  }));
  const districtOptions = (Array.isArray(district) ? district : []).map((item: any) => ({
    label: getDistrictLabel(item),
    value: item.ID as number,
  }));
  const subdistrictOptions = (Array.isArray(subdistrict) ? subdistrict : []).map((item: any) => ({
    label: getSubdistrictLabel(item),
    value: item.ID as number,
  }));
  const guideOptions = (Array.isArray(guides) ? guides : []).map((item: any) => ({
    label: getGuideLabel(item),
    value: item.ID as number,
  }));

  return (
    <div>
      {contextHolder}
      <Card variant="outlined">
        <h2>เพิ่มข้อมูล แพ็คเกจ</h2>
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
            <Col xs={24} sm={24} md={24} lg={12}>
              <Form.Item
                label="ชื่อแพ็คเกจ"
                name="Name"
                rules={[{ required: true, message: "กรุณากรอกชื่อแพ็คเกจ !" }]}
              >
                <Input />
              </Form.Item>
            </Col>

            {/* จำนวนคน */}
            <Col xs={24} sm={24} md={24} lg={12}>
              <Form.Item
                label="จำนวนคน"
                name="People"
                rules={[{ required: true, message: "กรุณากรอกจำนวนคน !" }]}
              >
                <InputNumber min={1} max={100} style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            {/* วันที่เริ่ม-สิ้นสุด */}
            <Col xs={24} sm={24} md={24} lg={12}>
              <Form.Item
                label="วันที่เริ่มต้น - วันที่สิ้นสุด"
                name="DateRange"
                rules={[{ required: true, message: "กรุณาเลือกวันที่ !" }]}
              >
                <RangePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            {/* ราคา */}
            <Col xs={24} sm={24} md={24} lg={12}>
              <Form.Item
                label="ราคา (บาท)"
                name="Price"
                rules={[{ required: true, message: "กรุณากรอกราคา !" }]}
              >
                <Input />
              </Form.Item>
            </Col>

            {/* จังหวัด */}
            <Col xs={24} sm={24} md={24} lg={12}>
              <Form.Item
                label="จังหวัด"
                name="ProvinceID"
                rules={[{ required: true, message: "กรุณาเลือกจังหวัด !" }]}
              >
                <Select
                  placeholder="เลือกจังหวัด"
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  loading={loadingProvince}
                  options={provinceOptions}
                  onChange={(value?: number) => {
                    setSelectedProvince(value ?? null);
                    setSelectedDistrict(null);
                    setSubdistrict([]);
                    form.setFieldsValue({ DistrictID: undefined, SubdistrictID: undefined });
                    if (typeof value === "number") void onGetDistrict(value);
                  }}
                />
              </Form.Item>
            </Col>

            {/* อำเภอ */}
            <Col xs={24} sm={24} md={24} lg={12}>
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
                  optionFilterProp="label"
                  loading={loadingDistrict}
                  options={districtOptions}
                  onChange={(value?: number) => {
                    setSelectedDistrict(value ?? null);
                    form.setFieldsValue({ SubdistrictID: undefined });
                    if (typeof value === "number") void onGetSubdistrict(value);
                    else setSubdistrict([]);
                  }}
                />
              </Form.Item>
            </Col>

            {/* ตำบล */}
            <Col xs={24} sm={24} md={24} lg={12}>
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
                  optionFilterProp="label"
                  loading={loadingSubdistrict}
                  options={subdistrictOptions}
                />
              </Form.Item>
            </Col>

            {/* ไกด์ */}
            <Col xs={24} sm={24} md={24} lg={12}>
              <Form.Item
                label="ไกด์"
                name="GuideID"
                rules={[{ required: true, message: "กรุณาเลือกไกด์ !" }]}
              >
                <Select
                  placeholder="เลือกไกด์"
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  loading={loadingGuides}
                  options={guideOptions}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* ปุ่ม */}
          <Row justify="end">
            <Col style={{ marginTop: 40 }}>
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

export default PackageCreate;
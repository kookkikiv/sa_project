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
import { type AccommodationInterface } from "../../../interface/Accommodation";
import { type ProvinceInterface } from "../../../interface/Province";
import { type DistrictInterface } from "../../../interface/District";
import { type SubdistrictInterface } from "../../../interface/Subdistrict";
import {
  GetProvince,
  GetDistrict,
  GetSubdistrict,
  CreateAccommodation,
} from "../../../services/https";
import { useNavigate, Link } from "react-router-dom";

function AccommodationCreate() {
  const navigate = useNavigate();
  const [form] = Form.useForm<AccommodationInterface>();
  const [messageApi, contextHolder] = message.useMessage();

  const [province, setProvince] = useState<ProvinceInterface[]>([]);
  const [district, setDistrict] = useState<DistrictInterface[]>([]);
  const [subdistrict, setSubdistrict] = useState<SubdistrictInterface[]>([]);

  const [loadingProvince, setLoadingProvince] = useState(false);
  const [loadingDistrict, setLoadingDistrict] = useState(false);
  const [loadingSubdistrict, setLoadingSubdistrict] = useState(false);

  const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);

  // --- Helpers: safe array extraction from API ---
  const asArray = <T,>(val: any): T[] =>
    Array.isArray(val) ? (val as T[]) :
    Array.isArray(val?.data) ? (val.data as T[]) :
    Array.isArray(val?.items) ? (val.items as T[]) : [];

  // โหลดจังหวัด
  const onGetProvince = async () => {
    try {
      setLoadingProvince(true);
      const res = await GetProvince();
      if (res.status === 200) {
        setProvince(asArray<ProvinceInterface>(res.data));
      } else {
        setProvince([]);
        messageApi.error(res?.data?.error ?? "ไม่พบข้อมูลจังหวัด");
        navigate("/accommodation");
      }
    } catch (e) {
      setProvince([]);
      messageApi.error("เกิดข้อผิดพลาดในการโหลดจังหวัด");
      navigate("/accommodation");
    } finally {
      setLoadingProvince(false);
    }
  };

  // โหลดอำเภอตามจังหวัด
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
    } catch (e) {
      setDistrict([]);
      messageApi.error("เกิดข้อผิดพลาดในการโหลดอำเภอ");
    } finally {
      setLoadingDistrict(false);
    }
  };

  // โหลดตำบลตามอำเภอ
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
    } catch (e) {
      setSubdistrict([]);
      messageApi.error("เกิดข้อผิดพลาดในการโหลดตำบล");
    } finally {
      setLoadingSubdistrict(false);
    }
  };

  // Submit
  const onFinish = async (values: AccommodationInterface) => {
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
      if (res.status === 201 || res.status === 200) {
        messageApi.success(res?.data?.message ?? "บันทึกสำเร็จ");
        navigate("/accommodation");
      } else {
        messageApi.error(res?.data?.error ?? "บันทึกไม่สำเร็จ");
      }
    } catch (e) {
      messageApi.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  useEffect(() => {
    void onGetProvince();
  }, []);

  return (
    <div>
      {contextHolder}
      <Card /* ถ้าเคยใช้ bordered ให้เปลี่ยนเป็น variant="outlined" ตาม antd v5 */>
        <h2>เพิ่มข้อมูล ที่พัก</h2>
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
            <Col xs={24} sm={24} md={24} lg={12}>
              <Form.Item
                label="ชื่อที่พัก"
                name="Name"
                rules={[{ required: true, message: "กรุณากรอกชื่อที่พัก !" }]}
              >
                <Input />
              </Form.Item>
            </Col>

            {/* ลักษณะที่พัก */}
            <Col xs={24} sm={24} md={24} lg={12}>
              <Form.Item
                label="ลักษณะที่พัก"
                name="Type"
                rules={[{ required: true, message: "กรุณาเลือกลักษณะที่พัก !" }]}
              >
                <Select placeholder="เลือกประเภทที่พัก" allowClear>
                  <Select.Option value="hotel">โรงแรม</Select.Option>
                  <Select.Option value="resort">รีสอร์ท</Select.Option>
                  <Select.Option value="hostel">โฮสเทล</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            {/* สถานะที่พัก */}
            <Col xs={24} sm={24} md={24} lg={12}>
              <Form.Item
                label="สถานะที่พัก"
                name="Status"
                rules={[{ required: true, message: "กรุณาเลือกสถานะที่พัก !" }]}
              >
                <Select placeholder="เลือกสถานะที่พัก" allowClear>
                  <Select.Option value="open">เปิดใช้บริการ</Select.Option>
                  <Select.Option value="closed">ปิดปรับปรุง</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            {/* จังหวัด - ใช้ชื่อฟิลด์ ProvinceID ให้ตรง backend */}
            <Col xs={24} sm={24} md={24} lg={12}>
              <Form.Item
                label="จังหวัด"
  name="ProvinceID"
  rules={[{ required: true, message: "กรุณาเลือกจังหวัด !" }]}
>
  <Select
    placeholder="เลือกจังหวัด"
    allowClear
    loading={loadingProvince}
    options={(Array.isArray(province) ? province : []).map((item) => ({
      label: item.NameTh,   // ✅ แสดงชื่อจังหวัด
      value: item.ID,       // ✅ ส่งค่า id กลับไปใน form
    }))}
    onChange={(value: number | null) => {
      setSelectedProvince(value ?? null);
      setSelectedDistrict(null);
      setSubdistrict([]);
      form.setFieldsValue({ DistrictID: undefined, SubdistrictID: undefined });
      if (typeof value === "number") {
        void onGetDistrict(value);
      }
    }}
  />
</Form.Item>

            </Col>

            {/* อำเภอ - ใช้ชื่อฟิลด์ DistrictID */}
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
  loading={loadingDistrict}
  options={(Array.isArray(district) ? district : []).map((item) => ({
    label: item.NameTh,
    value: item.ID,
  }))}
  onChange={(value: number | null) => {
    setSelectedDistrict(value ?? null);
    form.setFieldsValue({ SubdistrictID: undefined });
    if (typeof value === "number") {
      void onGetSubdistrict(value);
    } else {
      setSubdistrict([]);
    }
  }}
/>

              </Form.Item>
            </Col>

            {/* ตำบล - ใช้ชื่อฟิลด์ SubdistrictID */}
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
  loading={loadingSubdistrict}
  options={(Array.isArray(subdistrict) ? subdistrict : []).map((item) => ({
    label: item.NameTh,
    value: item.ID,
  }))}
/>
              </Form.Item>
            </Col>
          </Row>

          {/* ปุ่ม */}
          <Row justify="end">
            <Col style={{ marginTop: 40 }}>
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

export default AccommodationCreate;

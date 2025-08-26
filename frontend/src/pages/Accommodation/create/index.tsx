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
  DatePicker,
  InputNumber,
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
  const [messageApi, contextHolder] = message.useMessage();

  const [province, setProvince] = useState<ProvinceInterface[]>([]);
  const [district, setDistrict] = useState<DistrictInterface[]>([]);
  const [subdistrict, setSubdistrict] = useState<SubdistrictInterface[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);

  // โหลดจังหวัด
  const onGetProvince = async () => {
    let res = await GetProvince();
    if (res.status === 200) {
      setProvince(res.data);
    } else {
      messageApi.error("ไม่พบข้อมูลจังหวัด");
      navigate("/accommodation");
    }
  };

  // โหลดอำเภอตามจังหวัด
  const onGetDistrict = async (provinceId: number) => {
    let res = await GetDistrict(provinceId);
    if (res.status === 200) {
      setDistrict(res.data);
    } else {
      messageApi.error("ไม่พบข้อมูลอำเภอ");
    }
  };

  // โหลดตำบลตามอำเภอ
  const onGetSubdistrict = async (districtId: number) => {
    let res = await GetSubdistrict(districtId);
    if (res.status === 200) {
      setSubdistrict(res.data);
    } else {
      messageApi.error("ไม่พบข้อมูลตำบล");
    }
  };

  const onFinish = async (values: AccommodationInterface) => {
    let res = await CreateAccommodation(values);

    if (res.status === 201) {
      messageApi.success(res.data.message);
      setTimeout(() => {
        navigate("/accommodation");
      }, 2000);
    } else {
      messageApi.error(res.data.error);
    }
  };

  useEffect(() => {
    onGetProvince();
  }, []);

  return (
    <div>
      {contextHolder}
      <Card>
        <h2>เพิ่มข้อมูล ที่พัก</h2>
        <Divider />
        <Form name="basic" layout="vertical" onFinish={onFinish} autoComplete="off">
          <Row gutter={[16, 0]}>
            {/* ชื่อที่พัก */}
            <Col xs={24} sm={24} md={24} lg={12}>
              <Form.Item
                label="ชื่อที่พัก"
                name="name"
                rules={[{ required: true, message: "กรุณากรอกชื่อ !" }]}
              >
                <Input />
              </Form.Item>
            </Col>

            {/* ลักษณะที่พัก */}
            <Col xs={24} sm={24} md={24} lg={12}>
              <Form.Item
                label="ลักษณะที่พัก"
                name="accommodation_type"
                rules={[{ required: true, message: "กรุณาเลือกลักษณะที่พัก !" }]}
              >
                <Select placeholder="เลือกประเภทที่พัก">
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
                name="accommodation_status"
                rules={[{ required: true, message: "กรุณาเลือกสถานะที่พัก !" }]}
              >
                <Select placeholder="เลือกสถานะที่พัก">
                  <Select.Option value="open">เปิดใช้บริการ</Select.Option>
                  <Select.Option value="closed">ปิดปรับปรุง</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            {/* จังหวัด */}
            <Col xs={24} sm={24} md={24} lg={12}>
              <Form.Item
                label="จังหวัด"
                name="province_id"
                rules={[{ required: true, message: "กรุณาเลือกจังหวัด !" }]}
              >
                <Select
                  placeholder="เลือกจังหวัด"
                  onChange={(value) => {
                    setSelectedProvince(value);
                    setSelectedDistrict(null);
                    setSubdistrict([]);
                    onGetDistrict(value);
                  }}
                  allowClear
                >
                  {province.map((item) => (
                    <Select.Option key={item.id} value={item.id}>
                      {item.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            {/* อำเภอ */}
            <Col xs={24} sm={24} md={24} lg={12}>
              <Form.Item
                label="อำเภอ"
                name="district_id"
                rules={[{ required: true, message: "กรุณาเลือกอำเภอ !" }]}
              >
                <Select
                  placeholder="เลือกอำเภอ"
                  onChange={(value) => {
                    setSelectedDistrict(value);
                    onGetSubdistrict(value);
                  }}
                  disabled={!selectedProvince}
                  allowClear
                >
                  {district.map((item) => (
                    <Select.Option key={item.id} value={item.id}>
                      {item.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            {/* ตำบล */}
            <Col xs={24} sm={24} md={24} lg={12}>
              <Form.Item
                label="ตำบล"
                name="subdistrict_id"
                rules={[{ required: true, message: "กรุณาเลือกตำบล !" }]}
              >
                <Select placeholder="เลือกตำบล" disabled={!selectedDistrict} allowClear>
                  {subdistrict.map((item) => (
                    <Select.Option key={item.id} value={item.id}>
                      {item.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* ปุ่ม */}
          <Row justify="end">
            <Col style={{ marginTop: "40px" }}>
              <Form.Item>
                <Space>
                  <Link to="/accommodation">
                    <Button htmlType="button" style={{ marginRight: "10px" }}>
                      ยกเลิก
                    </Button>
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

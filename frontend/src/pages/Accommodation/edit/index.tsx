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
import { useNavigate, Link, useParams } from "react-router-dom";

function AccommodationEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: any }>();
  const [messageApi, contextHolder] = message.useMessage();
  const [province, setProvince] = useState<ProvinceInterface[]>([]);
  const [district, setDistrict] = useState<DistrictInterface[]>([]);
  const [subdistrict, setSubdistrict] = useState<SubdistrictInterface[]>([]);
  const [form] = Form.useForm();
  const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);

 const onGetProvince = async () => {
    let res = await GetProvince();
    if (res.status == 200) {
      setProvince(res.data);
    } else {
      messageApi.open({
        type: "error",
        content: "ไม่พบข้อมูลจังหวัด",
      });
      
      setTimeout(() => {
        navigate("/accommodation");
      }, 2000);
    }
  };

   const onGetDistrict = async (provinceId: number) => {
    let res = await GetDistrict(provinceId);
    if (res.status == 200) {
      setDistrict(res.data);
    } else {
      messageApi.open({
        type: "error",
        content: "ไม่พบข้อมูลอำเภอ",
      });
      
      setTimeout(() => {
        navigate("/accommodation");
      }, 2000);
    }
  };

   const onGetSubdistrict = async (districtId: number) => {
    let res = await GetSubdistrict(districtId);
    if (res.status == 200) {
      setSubdistrict(res.data);
    } else {
      messageApi.open({
        type: "error",
        content: "ไม่พบข้อมูลตำบล",
      });
      
      setTimeout(() => {
        navigate("/accommodation");
      }, 2000);
    }
  };

  const getAccommodationById = async (id: string) => {
  let res = await GetAccommodationById(id);
  if (res.status == 200) {
    form.setFieldsValue({
      Name: res.data.Name,
      Type: res.data.Type,
      Status: res.data.Status,
      Province: res.data.ProvinceID,
      District: res.data.DistrictID,
      Subdistrict: res.data.SubdistrictID,
    });
    
    // โหลดข้อมูล District และ Subdistrict ตาม Province และ District ที่มีอยู่
    if (res.data.ProvinceID) {
      setSelectedProvince(res.data.ProvinceID);
      await onGetDistrict(res.data.ProvinceID);
      
      if (res.data.DistrictID) {
        setSelectedDistrict(res.data.DistrictID);
        await onGetSubdistrict(res.data.DistrictID);
      }
    }
  } else {
    messageApi.open({
      type: "error",
      content: "ไม่พบข้อมูลที่พัก",
    });

    setTimeout(() => {
      navigate("/accommodation");
    }, 2000);
  }
};

const onFinish = async (values: AccommodationInterface) => {
  // เพิ่ม AdminID จาก localStorage
  const adminId = localStorage.getItem("id");
  
  // ✅ แก้ไข field names ให้ตรงกับ Backend
  let payload = {
    Name: values.Name,
    Type: values.Type,
    Status: values.Status,
    ProvinceID: values.ProvinceID,    // ✅ ใช้ ProvinceID ตรงๆ
    DistrictID: values.DistrictID,    // ✅ ใช้ DistrictID ตรงๆ  
    SubdistrictID: values.SubdistrictID, // ✅ ใช้ SubdistrictID ตรงๆ
    AdminID: adminId ? parseInt(adminId) : undefined
  };

  let res = await UpdateAccommodationById(id, payload);

  if (res.status === 200) {
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
    getAccommodationById(id);
  }, []);

  return (
    <div>
      {contextHolder}
      <Card>
        <h2>แก้ไขข้อมูล ที่พัก</h2>
        <Divider />

        <Form
          name="basic"
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >

          <Row gutter={[16, 0]}>
            <Col xs={24} sm={24} md={24} lg={24} xl={12}>
              <Form.Item
                label="ชื่อที่พัก"
                name="Name"
                rules={[
                  {
                    required: true,
                    message: "กรุณากรอกชื่อที่พัก !",
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={12}>
              <Form.Item
                label="ลักษณะที่พัก"
                name="Type"
                rules={[
                  {
                    required: true,
                    message: "กรุณาเลือกลักษณะที่พัก !",
                  },
                ]}
              >
                <Select placeholder="เลือกประเภทที่พัก">
                  <Select.Option value="hotel">โรงแรม</Select.Option>
                  <Select.Option value="resort">รีสอร์ท</Select.Option>
                  <Select.Option value="hostel">โฮสเทล</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={24} lg={12}>
              <Form.Item
                label="สถานะที่พัก"
                name="Status"
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
                name="ProvinceID"
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
                    <Select.Option key={item.ID} value={item.ID}>
                      {item.NameTh}
                    </Select.Option>
                  ))}
                </Select>
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
                  onChange={(value) => {
                    setSelectedDistrict(value);
                    onGetSubdistrict(value);
                  }}
                  disabled={!selectedProvince}
                  allowClear
                >
                  {district.map((item) => (
                    <Select.Option key={item.ID} value={item.ID}>
                      {item.NameTh}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            {/* ตำบล */}
            <Col xs={24} sm={24} md={24} lg={12}>
              <Form.Item
                label="ตำบล"
                name="SubdistrictID"
                rules={[{ required: true, message: "กรุณาเลือกตำบล !" }]}
              >
                <Select placeholder="เลือกตำบล" disabled={!selectedDistrict} allowClear>
                  {subdistrict.map((item) => (
                    <Select.Option key={item.ID} value={item.ID}>
                      {item.NameTh}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row justify="end">
            <Col style={{ marginTop: "40px" }}>
              <Form.Item>
                <Space>
                  <Link to="/accommodation">
                    <Button htmlType="button" style={{ marginRight: "10px" }}>
                      ยกเลิก
                    </Button>
                  </Link>

                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<PlusOutlined />}
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

export default AccommodationEdit;
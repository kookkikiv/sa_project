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
import {  useEffect } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { type RoomInterface } from "../../../interface/Room";
import {
  CreateRoom,
} from "../../../services/https";
import { useNavigate, Link } from "react-router-dom";

function RoomCreate() {
  const navigate = useNavigate();
  const [form] = Form.useForm<RoomInterface>();
  const [messageApi, contextHolder] = message.useMessage();
  
  // Submit function
  const onFinish = async (values: RoomInterface) => {
    try {
      const adminId = localStorage.getItem("id");
      const payload = {
        Name: values.Name,
        Type: values.Type,
        BedType: values.Type,
        Price:values.Price,
        People:values.People,
        Status: values.Status,
        AdminID: adminId ? parseInt(adminId, 10) : undefined,
      };

      const res = await CreateRoom(payload);
      if (res.status === 201 || res.status === 200) {
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
   
  }, []);

  return (
    <div>
      {contextHolder}
      <Card variant="outlined">
        <h2>เพิ่มข้อมูลห้องพัก</h2>
        <Divider />
        <Form
          form={form}
          name="room-create"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Row gutter={[16, 0]}>
            {/* ชื่อที่พัก */}
            <Col xs={24} sm={24} md={24} lg={12}>
              <Form.Item
                label="ชื่อห้องพัก"
                name="Name"
                rules={[{ required: true, message: "กรุณากรอกชื่อห้องพัก !" }]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={24} lg={12}>
              <Form.Item
                label="ลักษณะห้องพัก"
                name="Type"
                rules={[{ required: true, message: "กรุณาเลือกลักษณะห้อง !" }]}
              >
                <Select placeholder="เลือกประเภทห้อง" allowClear showSearch optionFilterProp="label">
                  <Select.Option value="hotel">ห้องมารตฐาน</Select.Option>
                  <Select.Option value="resort">ห้องสวีท</Select.Option>
                  <Select.Option value="resort">ห้องครอบครัว</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            {/* ลักษณะที่พัก */}
            <Col xs={24} sm={24} md={24} lg={12}>
              <Form.Item
                label="ลักษณะเตียง"
                name="BedType"
                rules={[{ required: true, message: "กรุณาเลือกลักษณะเตียง !" }]}
              >
                <Select placeholder="เลือกประเภทเตียง" allowClear showSearch optionFilterProp="label">
                  <Select.Option value="hotel">เตียงเดี่ยว</Select.Option>
                  <Select.Option value="resort">เตียงคู่</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            {/* สถานะที่พัก */}
            <Col xs={24} sm={24} md={24} lg={12}>
              <Form.Item
                label="สถานะห้องพัก"
                name="Status"
                rules={[{ required: true, message: "กรุณาเลือกสถานะห้องพัก !" }]}
              >
                <Select placeholder="เลือกสถานะที่พัก" allowClear showSearch optionFilterProp="label">
                  <Select.Option value="open">เปิดใช้บริการ</Select.Option>
                  <Select.Option value="closed">ปิดปรับปรุง</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* ปุ่ม */}
          <Row justify="end">
            <Col style={{ marginTop: 40 }}>
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
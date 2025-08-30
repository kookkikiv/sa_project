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
} from "antd";
import { useEffect } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { type AdminInterface } from "../../../interface/IAdmin";
import { CreateAdmin } from "../../../services/https";
import { useNavigate, Link } from "react-router-dom";

function AdminCreate() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const onFinish = async (values: any) => {
    // Transform form values to match backend field names
    const payload: AdminInterface = {
      Firstname: values.Firstname,
      Lastname: values.Lastname, 
      Email: values.Email,
      Password: values.Password,
      Birthday: values.Birthday ? values.Birthday.format('YYYY-MM-DD') : undefined,
    };

    try {
      const res = await CreateAdmin(payload);
      if (res.status === 201 || res.status === 200) {
        messageApi.success(res.data?.message ?? "เพิ่มข้อมูลผู้ดูแลระบบสำเร็จ");
        setTimeout(() => {
          navigate("/admin");
        }, 2000);
      } else {
        messageApi.error(res.data?.error ?? "เพิ่มข้อมูลไม่สำเร็จ");
      }
    } catch (error) {
      messageApi.error("เกิดข้อผิดพลาดในการเพิ่มข้อมูล");
    }
  };

  useEffect(() => {
    return () => {};
  }, []);

  return (
    <div>
      {contextHolder}
      <Card>
        <h2>เพิ่มข้อมูล ผู้ดูแลระบบ</h2>
        <Divider />
        <Form
          name="admin-create"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={24} md={24} lg={24} xl={12}>
              <Form.Item
                label="ชื่อจริง"
                name="Firstname"  // Fixed: was first_name
                rules={[
                  {
                    required: true,
                    message: "กรุณากรอกชื่อ !",
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={12}>
              <Form.Item
                label="นามสกุล"
                name="Lastname"  // Fixed: was last_name
                rules={[
                  {
                    required: true,
                    message: "กรุณากรอกนามสกุล !",
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={12}>
              <Form.Item
                label="อีเมล"
                name="Email"  // Fixed: was email
                rules={[
                  {
                    type: "email",
                    message: "รูปแบบอีเมลไม่ถูกต้อง !",
                  },
                  {
                    required: true,
                    message: "กรุณากรอกอีเมล !",
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={12}>
              <Form.Item
                label="รหัสผ่าน"
                name="Password"  // Fixed: was password
                rules={[
                  {
                    required: true,
                    message: "กรุณากรอกรหัสผ่าน !",
                  },
                ]}
              >
                <Input.Password />
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={12}>
              <Form.Item
                label="วัน/เดือน/ปี เกิด"
                name="Birthday"  // Fixed: was birthday
                rules={[
                  {
                    required: true,
                    message: "กรุณาเลือกวัน/เดือน/ปี เกิด !",
                  },
                ]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row justify="end">
            <Col style={{ marginTop: "40px" }}>
              <Form.Item>
                <Space>
                  <Link to="/admin">
                    <Button htmlType="button" style={{ marginRight: "10px" }}>
                      ยกเลิก
                    </Button>
                  </Link>

                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<PlusOutlined />}
                  >
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

export default AdminCreate;
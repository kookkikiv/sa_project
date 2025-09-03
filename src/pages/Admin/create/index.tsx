import React, { useState } from "react";
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
  Spin,
} from "antd";
import { SaveOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";

// Admin Interface
interface AdminInterface {
  Firstname?: string;
  Lastname?: string;
  Email?: string;
  Password?: string;
  Birthday?: string;
}

// API Function
const apiUrl = "http://localhost:8000";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  const tokenType = localStorage.getItem("token_type");
  return {
    "Content-Type": "application/json",
    ...(token && tokenType ? { Authorization: `${tokenType} ${token}` } : {}),
  };
};

const createAdmin = async (data: AdminInterface) => {
  try {
    const response = await fetch(`${apiUrl}/signup`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const result = await response.json();
    return { status: response.status, data: result };
  } catch (error) {
    console.error("Create error:", error);
    return { status: 500, data: { error: "Network error" } };
  }
};

const AdminCreate: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);

      // Prepare data
      const payload: AdminInterface = {
        Firstname: values.Firstname?.trim(),
        Lastname: values.Lastname?.trim(),
        Email: values.Email?.trim().toLowerCase(),
        Password: values.Password?.trim(),
        Birthday: values.Birthday ? values.Birthday.format('YYYY-MM-DD') : undefined,
      };

      // Validate required fields
      if (!payload.Firstname || !payload.Lastname || !payload.Email || !payload.Password) {
        messageApi.error("กรุณากรอกข้อมูลให้ครบถ้วน");
        return;
      }

      const res = await createAdmin(payload);
      
      if (res.status === 201 || res.status === 200) {
        messageApi.success(res.data?.message || "เพิ่มข้อมูลผู้ดูแลระบบสำเร็จ");
        form.resetFields();
        setTimeout(() => {
          navigate("/admin");
        }, 1500);
      } else {
        messageApi.error(res.data?.error || "เพิ่มข้อมูลไม่สำเร็จ");
      }
    } catch (error) {
      console.error("Error creating admin:", error);
      messageApi.error("เกิดข้อผิดพลาดในการเพิ่มข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {contextHolder}
      
      {/* Header */}
      <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Link to="/admin">
            <Button 
              icon={<ArrowLeftOutlined />}
              size="large"
            >
              กลับ
            </Button>
          </Link>
        </Col>
        <Col flex="auto">
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>
            เพิ่มข้อมูลผู้ดูแลระบบใหม่
          </h2>
        </Col>
      </Row>

      {/* Form Card */}
      <Card 
        style={{ 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderRadius: '8px'
        }}
      >
        <Spin spinning={loading}>
          <Form
            form={form}
            name="admin-create"
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
            requiredMark="optional"
          >
            <Row gutter={[24, 16]}>
              {/* Personal Information Section */}
              <Col span={24}>
                <Divider orientation="left" style={{ fontSize: '16px', fontWeight: 500 }}>
                  ข้อมูลส่วนตัว
                </Divider>
              </Col>

              <Col xs={24} sm={12} md={12} lg={8}>
                <Form.Item
                  label="ชื่อจริง"
                  name="Firstname"
                  rules={[
                    { required: true, message: "กรุณากรอกชื่อ" },
                    { min: 2, message: "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร" },
                    { max: 50, message: "ชื่อต้องไม่เกิน 50 ตัวอักษร" },
                    { 
                      pattern: /^[a-zA-Zก-๙\s]+$/, 
                      message: "ชื่อต้องเป็นตัวอักษรเท่านั้น" 
                    },
                  ]}
                >
                  <Input 
                    placeholder="กรอกชื่อจริง" 
                    size="large"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={12} lg={8}>
                <Form.Item
                  label="นามสกุล"
                  name="Lastname"
                  rules={[
                    { required: true, message: "กรุณากรอกนามสกุล" },
                    { min: 2, message: "นามสกุลต้องมีอย่างน้อย 2 ตัวอักษร" },
                    { max: 50, message: "นามสกุลต้องไม่เกิน 50 ตัวอักษร" },
                    { 
                      pattern: /^[a-zA-Zก-๙\s]+$/, 
                      message: "นามสกุลต้องเป็นตัวอักษรเท่านั้น" 
                    },
                  ]}
                >
                  <Input 
                    placeholder="กรอกนามสกุล" 
                    size="large"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={12} lg={8}>
                <Form.Item
                  label="วัน/เดือน/ปี เกิด"
                  name="Birthday"
                  rules={[
                    { required: true, message: "กรุณาเลือกวันเกิด" },
                  ]}
                >
                  <DatePicker 
                    style={{ width: "100%" }} 
                    placeholder="เลือกวันเกิด"
                    format="DD/MM/YYYY"
                    size="large"
                  />
                </Form.Item>
              </Col>

              {/* Account Information Section */}
              <Col span={24}>
                <Divider orientation="left" style={{ fontSize: '16px', fontWeight: 500 }}>
                  ข้อมูลบัญชีผู้ใช้
                </Divider>
              </Col>

              <Col xs={24} sm={12} md={12} lg={12}>
                <Form.Item
                  label="อีเมล"
                  name="Email"
                  rules={[
                    { required: true, message: "กรุณากรอกอีเมล" },
                    { type: "email", message: "รูปแบบอีเมลไม่ถูกต้อง" },
                  ]}
                >
                  <Input 
                    placeholder="กรอกอีเมล" 
                    size="large"
                    type="email"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={12} lg={12}>
                <Form.Item
                  label="รหัสผ่าน"
                  name="Password"
                  rules={[
                    { required: true, message: "กรุณากรอกรหัสผ่าน" },
                    { min: 6, message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" },
                    { max: 50, message: "รหัสผ่านต้องไม่เกิน 50 ตัวอักษร" },
                  ]}
                >
                  <Input.Password 
                    placeholder="กรอกรหัสผ่าน" 
                    size="large"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={12} lg={12}>
                <Form.Item
                  label="ยืนยันรหัสผ่าน"
                  name="ConfirmPassword"
                  dependencies={['Password']}
                  rules={[
                    { required: true, message: "กรุณายืนยันรหัสผ่าน" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('Password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('รหัสผ่านไม่ตรงกัน'));
                      },
                    }),
                  ]}
                >
                  <Input.Password 
                    placeholder="ยืนยันรหัสผ่าน" 
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Action Buttons */}
            <Row justify="end" style={{ marginTop: 32 }}>
              <Col>
                <Space size="middle">
                  <Link to="/admin">
                    <Button 
                      size="large"
                      disabled={loading}
                    >
                      ยกเลิก
                    </Button>
                  </Link>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    size="large"
                    loading={loading}
                  >
                    {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                  </Button>
                </Space>
              </Col>
            </Row>
          </Form>
        </Spin>
      </Card>
    </div>
  );
};

export default AdminCreate;
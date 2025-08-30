// frontend/src/pages/Admin/edit/index.tsx - Fixed field names
import { useEffect } from "react";
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

import { PlusOutlined } from "@ant-design/icons";
import { type AdminInterface } from "../../../interface/IAdmin";
import { GetAdminById, UpdateAdminById } from "../../../services/https/index";
import { useNavigate, Link, useParams } from "react-router-dom";
import dayjs from "dayjs";

function AdminEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  const getAdminById = async (id: string) => {
    try {
      const res = await GetAdminById(id);
      if (res.status === 200) {
        const adminData = res.data?.data || res.data; // Handle different response formats
        
        form.setFieldsValue({
          Firstname: adminData.Firstname,
          Lastname: adminData.Lastname,
          Email: adminData.Email,
          Birthday: adminData.Birthday ? dayjs(adminData.Birthday) : null,
        });
      } else {
        messageApi.error("ไม่พบข้อมูลผู้ดูแลระบบ");
        setTimeout(() => {
          navigate("/admin");
        }, 2000);
      }
    } catch (error) {
      messageApi.error("เกิดข้อผิดพลาดในการดึงข้อมูล");
      setTimeout(() => {
        navigate("/admin");
      }, 2000);
    }
  };

  const onFinish = async (values: any) => {
    try {
      // Transform form values to match backend
      const payload: AdminInterface = {
        Firstname: values.Firstname,
        Lastname: values.Lastname,
        Email: values.Email,
        Birthday: values.Birthday ? values.Birthday.format('YYYY-MM-DD') : undefined,
        // Don't include password unless it's being changed
        ...(values.Password && { Password: values.Password }),
      };

      const res = await UpdateAdminById(id!, payload);
      if (res.status === 200) {
        messageApi.success(res.data?.message ?? "แก้ไขข้อมูลสำเร็จ");
        setTimeout(() => {
          navigate("/admin");
        }, 2000);
      } else {
        messageApi.error(res.data?.error ?? "แก้ไขข้อมูลไม่สำเร็จ");
      }
    } catch (error) {
      messageApi.error("เกิดข้อผิดพลาดในการแก้ไขข้อมูล");
    }
  };

  useEffect(() => {
    if (id) {
      getAdminById(id);
    }
  }, [id]);

  return (
    <div>
      {contextHolder}
      <Card>
        <h2>แก้ไขข้อมูล ผู้ดูแลระบบ</h2>
        <Divider />

        <Form
          name="admin-edit"
          form={form}
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
                label="รหัสผ่านใหม่ (ถ้าต้องการเปลี่ยน)"
                name="Password"  // Fixed: was password
              >
                <Input.Password placeholder="ใส่รหัสผ่านใหม่ หากต้องการเปลี่ยน" />
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

export default AdminEdit;
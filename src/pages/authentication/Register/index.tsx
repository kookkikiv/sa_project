// frontend/src/pages/authentication/Register/index.tsx - Fixed field names
import {
  Button,
  Card,
  Form,
  Input,
  message,
  Flex,
  Row,
  Col,
  DatePicker,
} from "antd";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CreateAdmin } from "../../../services/https";
import { type AdminInterface } from "../../../interface/IAdmin";
import logo from "../../../assets/logo.png";

function SignUpPages() {
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
        messageApi.success(res.data?.message ?? "สมัครสมาชิกสำเร็จ");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        messageApi.error(res.data?.error ?? "สมัครสมาชิกไม่สำเร็จ");
      }
    } catch (error) {
      messageApi.error("เกิดข้อผิดพลาดในการสมัครสมาชิก");
    }
  };

  useEffect(() => {
    // Initial setup if needed
  }, []);

  return (
    <>
      {contextHolder}
      <Flex justify="center" align="center" className="login">
        <Card className="card-login" style={{ width: 600 }}>
          <Row align={"middle"} justify={"center"}>
            <Col xs={24} sm={24} md={24} lg={10} xl={10}>
              <img alt="logo" src={logo} className="images-logo" />
            </Col>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <h2 className="header">Sign Up</h2>
              <Form
                name="signup"
                layout="vertical"
                onFinish={onFinish}
                autoComplete="off"
              >
                <Row gutter={[16, 0]} align={"middle"}>
                  <Col xs={24} sm={24} md={24} lg={24} xl={24}>
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

                  <Col xs={24} sm={24} md={24} lg={24} xl={24}>
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

                  <Col xs={24} sm={24} md={24} lg={24} xl={24}>
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

                  <Col xs={24} sm={24} md={24} lg={12} xl={12}>
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

                  <Col xs={24} sm={24} md={24} lg={12} xl={12}>
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

                  <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        className="login-form-button"
                        style={{ marginBottom: 20 }}
                      >
                        Sign up
                      </Button>
                      Or <a onClick={() => navigate("/")}>signin now !</a>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Col>
          </Row>
        </Card>
      </Flex>
    </>
  );
}

export default SignUpPages;
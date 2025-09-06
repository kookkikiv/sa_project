// frontend/src/pages/authentication/Register/index.tsx
import {
  Button, Card, Form, Input, message, Flex, Row, Col, DatePicker,
} from "antd";
import { useNavigate } from "react-router-dom";
import { CreateAdmin } from "../../../services/https";
import { type AdminInterface } from "../../../interface/IAdmin"; // 👈 ปรับชื่อ interface
import logo from "../../../assets/logo.png";

function SignUpPages() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const onFinish = async (values: any) => {
    const payload: AdminInterface = {
      admin_first_name: values.admin_first_name,
      admin_last_name:  values.admin_last_name,
      admin_email:      values.admin_email,
      password:         values.password, 
      admin_birthday:   values.admin_birthday
                          ? values.birthday.format("YYYY-MM-DD")
                          : undefined,
    };

    try {
      const res = await CreateAdmin(payload);
      if (res.status === 201 || res.status === 200) {
        messageApi.success(res.data?.message ?? "สมัครสมาชิกสำเร็จ");
        setTimeout(() => navigate("/login"), 800); // 👈 เด้งไปหน้า login
      } else {
        messageApi.error(res.data?.error ?? "สมัครสมาชิกไม่สำเร็จ");
      }
    } catch {
      messageApi.error("เกิดข้อผิดพลาดในการสมัครสมาชิก");
    }
  };

  return (
    <>
      {contextHolder}
      <Flex justify="center" align="center" className="login">
        <Card className="card-login" style={{ width: 600 }}>
          <Row align="middle" justify="center">
            <Col xs={24} md={10}>
              <img alt="logo" src={logo} className="images-logo" />
            </Col>
            <Col xs={24}>
              <h2 className="header">Sign Up</h2>
              <Form name="signup" layout="vertical" onFinish={onFinish} autoComplete="off">
                <Row gutter={[16, 0]} align="middle">
                  <Col span={24}>
                    <Form.Item
                      label="ชื่อจริง"
                      name="admin_first_name"
                      rules={[{ required: true, message: "กรุณากรอกชื่อ !" }]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>

                  <Col span={24}>
                    <Form.Item
                      label="นามสกุล"
                      name="admin_last_name"
                      rules={[{ required: true, message: "กรุณากรอกนามสกุล !" }]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>

                  <Col span={24}>
                    <Form.Item
                      label="อีเมล"
                      name="admin_email"
                      rules={[
                        { type: "email", message: "รูปแบบอีเมลไม่ถูกต้อง !" },
                        { required: true, message: "กรุณากรอกอีเมล !" },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      label="รหัสผ่าน"
                      name="password"  
                      rules={[{ required: true, message: "กรุณากรอกรหัสผ่าน !" }]}
                    >
                      <Input.Password />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      label="วัน/เดือน/ปี เกิด"
                      name="admin_birthday"
                      rules={[{ required: true, message: "กรุณาเลือกวัน/เดือน/ปี เกิด !" }]}
                    >
                      <DatePicker style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>

                  <Col span={24}>
                    <Form.Item>
                      <Button type="primary" htmlType="submit" className="login-form-button" style={{ marginBottom: 20 }}>
                        Sign up
                      </Button>
                      Or <a onClick={() => navigate("/login")}>signin now !</a>
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

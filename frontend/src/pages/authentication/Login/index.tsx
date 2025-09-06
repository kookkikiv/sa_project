// frontend/src/pages/authentication/Login/index.tsx - Fixed field names
import { Button, Card, Form, Input, message, Flex, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import { SignIn } from "../../../services/https";
import { type SignInInterface } from "../../../interface/SignIn";
import logo from "../../../assets/logo.png";

function SignInPages() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  
  const onFinish = async (values: any) => {
    const payload: SignInInterface = {
      Email: values.email,
      Password: values.password,
    };

    try {
      const res = await SignIn(payload);
      if (res.status === 200) {
        messageApi.success("เข้าสู่ระบบสำเร็จ");
        localStorage.setItem("isLogin", "true");
        localStorage.setItem("page", "dashboard");
        localStorage.setItem("token_type", res.data.token_type);
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("id", res.data.id);

        setTimeout(() => {
          location.href = "/";
        }, 2000);
      } else {
        messageApi.error(res.data?.error ?? "เข้าสู่ระบบไม่สำเร็จ");
      }
    } catch (error) {
      messageApi.error("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    }
  };

  return (
    <>
      {contextHolder}
      <Flex justify="center" align="center" className="login">
        <Card className="card-login" style={{ width: 500 }}>
          <Row align={"middle"} justify={"center"} style={{ height: "400px" }}>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <img
                alt="logo"
                style={{ width: "80%" }}
                src={logo}
                className="images-logo"
              />
            </Col>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <Form
                name="signin"
                onFinish={onFinish}
                autoComplete="off"
                layout="vertical"
              >
                <Form.Item
                  label="Email"
                  name="email"  
                  rules={[
                    { required: true, message: "กรุณากรอกอีเมล!" },
                    { type: "email", message: "รูปแบบอีเมลไม่ถูกต้อง!" },
                  ]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  label="Password"
                  name="password"  
                  rules={[
                    { required: true, message: "กรุณากรอกรหัสผ่าน!" },
                  ]}
                >
                  <Input.Password />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="login-form-button"
                    style={{ marginBottom: 20 }}
                  >
                    Log in
                  </Button>
                  Or <a onClick={() => navigate("/signup")}>signup now !</a>
                </Form.Item>
              </Form>
            </Col>
          </Row>
        </Card>
      </Flex>
    </>
  );
}
export default SignInPages;
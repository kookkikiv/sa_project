import type { FC } from 'react';
import { Modal, Input, Button, Typography, Form } from "antd";

const { Text } = Typography;

interface RegisterProps {
  visible: boolean;
  onClose: () => void;
}

const Register: FC<RegisterProps> = ({ visible, onClose }) => {
  const [form] = Form.useForm();

  const handleRegister = () => {
    form
      .validateFields()
      .then((values) => {
        console.log("Register values:", values);
        // Call backend API here
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      styles={{
    body: { padding: '32px', borderRadius: '12px', maxWidth: '400px', margin: '0 auto' },
    mask: { backdropFilter: 'blur(6px)', backgroundColor: 'rgba(0,0,0,0.25)' },
  }}
    >
      <h2 style={{ textAlign: "center", marginBottom: 8 }}>สมัครสมาชิก</h2>
      <Text
        style={{
          display: "block",
          textAlign: "center",
          marginBottom: 24,
          color: "#555",
        }}
      >
        ลงทะเบียนเพื่อสร้างบัญชีและรับสิทธิพิเศษมากมาย
      </Text>

      <Form form={form} layout="vertical">
        {/* Email with format validation */}
        <Form.Item
          name="email"
          rules={[
            { required: true, message: "กรุณากรอกอีเมล" },
            { type: "email", message: "รูปแบบอีเมลไม่ถูกต้อง" },
          ]}
        >
          <Input placeholder="อีเมล" style={{ marginBottom: 12 }} />
        </Form.Item>

        <Form.Item
          name="username"
          rules={[{ required: true, message: "กรุณากรอกชื่อผู้ใช้" }]}
        >
          <Input placeholder="ชื่อผู้ใช้" style={{ marginBottom: 12 }} />
        </Form.Item>

        <div style={{ display: "flex", gap: "12px", marginBottom: 12 }}>
          <Form.Item
            name="first_name"
            rules={[{ required: true, message: "กรุณากรอกชื่อจริง" }]}
            style={{ flex: 1 }}
          >
            <Input placeholder="ชื่อจริง" />
          </Form.Item>

          <Form.Item
            name="last_name"
            rules={[{ required: true, message: "กรุณากรอกนามสกุล" }]}
            style={{ flex: 1 }}
          >
            <Input placeholder="นามสกุล" />
          </Form.Item>
        </div>

        <div style={{ display: "flex", gap: "12px", marginBottom: 12 }}>
          <Form.Item
            name="password"
            rules={[
              { required: true, message: "กรุณากรอกรหัสผ่าน" },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  const firstChar = value.charAt(0);
                  const specialCharPattern = /[!@#$%^&*(),.?":{}|<>]/;
                  const numberPattern = /[0-9]/;
                  if (firstChar !== firstChar.toUpperCase())
                    return Promise.reject(new Error("ตัวอักษรตัวแรกต้องเป็นตัวพิมพ์ใหญ่"));
                  if (!specialCharPattern.test(value))
                    return Promise.reject(new Error("รหัสผ่านต้องมีอักขระพิเศษอย่างน้อย 1 ตัว เช่น ! @ # $ % ^ & * ( ) _ + - . , ?"));
                  if (!numberPattern.test(value))
                    return Promise.reject(new Error("รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว"));
                  return Promise.resolve();
                },
              },
            ]}
            style={{ flex: 1 }}
          >
            <Input.Password placeholder="รหัสผ่าน" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "กรุณายืนยันรหัสผ่าน" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("รหัสผ่านไม่ตรงกัน"));
                },
              }),
            ]}
            style={{ flex: 1 }}
          >
            <Input.Password placeholder="ยืนยันรหัสผ่าน" />
          </Form.Item>
        </div>

        <Form.Item
          name="birth_day"
          rules={[{ required: true, message: "กรุณาเลือกวันเกิด" }]}
        >
          <Input type="date" style={{ marginBottom: 12 }} />
        </Form.Item>

        <Form.Item
          name="phonenumber"
          rules={[{ required: true, message: "กรุณากรอกเบอร์โทรศัพท์" }]}
        >
          <Input placeholder="เบอร์โทรศัพท์" style={{ marginBottom: 16 }} />
        </Form.Item>

        <Button type="primary" block onClick={handleRegister}>
          สมัครสมาชิก
        </Button>
      </Form>
    </Modal>
  );
};

export default Register;

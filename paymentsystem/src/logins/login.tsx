import React, { useState } from 'react';
import type { FC } from 'react';
import { Modal, Input, Button, Divider, Typography } from 'antd';
import { GoogleOutlined, FacebookOutlined } from '@ant-design/icons';


const { Text } = Typography;

// Define props for SocialButton
interface SocialButtonProps {
  bgColor?: string;
  color?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  border?: string;
}

// SocialButton component
const SocialButton: FC<SocialButtonProps> = ({ bgColor, color, icon, children, onClick, border }) => (
  <Button
    block
    onClick={onClick}
    style={{
      backgroundColor: bgColor || 'transparent',
      color: color || '#000',
      border: border || 'none',
      marginBottom: 12,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s',
    }}
    onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
    onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
    icon={icon}
  >
    {children}
  </Button>
);

// -----------------------------
// Login Props
// -----------------------------
interface LoginProps {
  visible: boolean;
  onClose: () => void;
}

const Login: FC<LoginProps> = ({ visible, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    console.log({ email, password });
    // Add actual login logic here
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
      <h2 style={{ textAlign: 'center', marginBottom: 8 }}>เข้าสู่ระบบ</h2>
      <Text style={{ display: 'block', textAlign: 'center', marginBottom: 24, color: '#555' }}>
        ล็อกอินเข้าสู่ระบบเพื่อรับข้อเสนอและสิทธิประโยชน์สุดพิเศษ
      </Text>

      {/* Social login */}
      <SocialButton bgColor="#4285F4" color="#fff" icon={<GoogleOutlined />}>
        เข้าสู่ระบบด้วยบัญชี Google
      </SocialButton>

      <SocialButton border="1px solid #1877F2" color="#1877F2" icon={<FacebookOutlined />}>
        เข้าสู่ระบบด้วยบัญชี Facebook
      </SocialButton>

      <Divider>หรือ</Divider>

      {/* Email/password */}
      <Input
        placeholder="อีเมล"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ marginBottom: 12 }}
      />
      <Input.Password
        placeholder="รหัสผ่าน"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ marginBottom: 8 }}
      />
      <Text style={{ display: 'block', textAlign: 'right', marginBottom: 24, color: '#1890ff', cursor: 'pointer' }}>
        ลืมรหัสผ่าน?
      </Text>

      <Button type="primary" block onClick={handleLogin}>
        ดำเนินการต่อ
      </Button>
    </Modal>
  );
};

export default Login;

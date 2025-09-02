import React, { useState } from 'react';
import { Layout, Menu, Card, Row, Col, Avatar, Typography, List, Divider, Badge, Tag } from 'antd';
import {
  UserOutlined,
  HistoryOutlined,
  CalendarOutlined,
  WalletOutlined,
  MessageOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
};

const itemVariants = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } };

const DashboardProfile = () => {
  const [lightMode, setLightMode] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const userInfo = {
    avatar: <Avatar size={64} src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" />,
    name: 'Alex Thompson',
    email: 'alex.thompson@example.com',
    phone: '+66 81-234-5678',
    joinDate: 'Member since 2023',
    status: 'Premium',
  };

  const stats = [
    { title: 'Total Bookings', value: 24, color: '#6366f1' },
    { title: 'Total Spent', value: '฿125,600', color: '#16a34a' },
    { title: 'Reward Points', value: 2450, color: '#a855f7' },
  ];

  const activityHistory = [
    { id: 1, activity: 'จองที่พัก: Resort Paradise Phuket', date: '2025-08-25', status: 'confirmed', amount: '฿8,500' },
    { id: 2, activity: 'เข้าร่วมกิจกรรม: Floating Market Tour', date: '2025-08-20', status: 'completed', amount: '฿1,200' },
    { id: 3, activity: 'แพ็คเกจทัวร์: เชียงใหม่ 3 วัน 2 คืน', date: '2025-08-18', status: 'upcoming', amount: '฿12,000' },
  ];

  const upcomingBookings = [
    { title: 'Resort Paradise Phuket', date: '15 Sep 2025', guests: '2 guests' },
    { title: 'Bangkok City Tour', date: '22 Sep 2025', guests: '1 guest' },
    { title: 'Krabi Island Hopping', date: '01 Oct 2025', guests: '4 guests' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'green';
      case 'completed': return 'blue';
      case 'upcoming': return 'orange';
      default: return 'default';
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02, boxShadow: '0 12px 40px rgba(0,0,0,0.15)' }}
        animate={{ filter: lightMode ? 'brightness(1.2)' : 'none' }}
        transition={{ duration: 0.3 }}
      >
        <Card bordered={false} style={{ borderRadius: 24, padding: '32px 28px', marginBottom: 24 }}>
          <Row align="middle" gutter={16}>
            <Col>
              <Avatar size={64} src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" />
            </Col>
            <Col>
              <Title level={4}>
                Alex Thompson <Tag color="purple">Premium</Tag>
              </Title>
              <Text>Username: alex123</Text><br/>
              <Text>Email: alex.thompson@example.com</Text><br/>
              <Text>Phone: +66 81-234-5678</Text><br/>
              <Text>Birthday: 1990-05-15</Text><br/>
              <Text type="secondary">Member since 2023</Text>
            </Col>
          </Row>
        </Card>

        {/* Stats Cards */}
        <Row gutter={[16,16]}>
          <Col xs={24} md={8}>
            <Card bordered={false} style={{ borderRadius: 24, padding: '24px', backgroundColor: '#f9fafb' }}>
              <Text type="secondary">Total Bookings</Text>
              <Title level={3} style={{ color: '#6366f1' }}>5</Title>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card bordered={false} style={{ borderRadius: 24, padding: '24px', backgroundColor: '#f9fafb' }}>
              <Text type="secondary">Total Reviews</Text>
              <Title level={3} style={{ color: '#16a34a' }}>12</Title>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card bordered={false} style={{ borderRadius: 24, padding: '24px', backgroundColor: '#f9fafb' }}>
              <Text type="secondary">Notifications</Text>
              <Title level={3} style={{ color: '#a855f7' }}>3</Title>
            </Card>
          </Col>
        </Row>
      </motion.div>
    </>
  );


      case 'history':
        return (
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <Card title="ประวัติการใช้งาน" bordered={false} style={{ borderRadius: 24, padding: '32px 28px', marginBottom: 24 }}>
              <List
                itemLayout="horizontal"
                dataSource={activityHistory}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      title={item.activity}
                      description={item.date}
                    />
                    <div>
                      <Text strong style={{ marginRight: 12 }}>{item.amount}</Text>
                      <Tag color={getStatusColor(item.status)}>{item.status}</Tag>
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          </motion.div>
        );

      case 'bookings':
        return (
          <Row gutter={[16,16]}>
            {upcomingBookings.map((booking) => (
              <Col xs={24} md={8} key={booking.title}>
                <motion.div whileHover={{ scale: 1.02, boxShadow: '0 12px 40px rgba(0,0,0,0.15)' }}>
                  <Card
                    title={booking.title}
                    bordered={false}
                    style={{ borderRadius: 24, padding: '24px', backgroundColor: '#f0f5ff' }}
                  >
                    <Text>{booking.date} • {booking.guests}</Text>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        );

      default:
        return <Card title={activeTab}>Content coming soon...</Card>;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      {/* Sidebar */}
      <Sider width={220} style={{ background: '#001529', paddingTop: 24 }}>
        <div style={{ color:'#fff', textAlign:'center', marginBottom:24, fontWeight:'bold', fontSize:16 }}>
          THAITOUR Dashboard
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={[activeTab]} onClick={e=>setActiveTab(e.key)}>
          <Menu.Item key="profile" icon={<UserOutlined />}>ข้อมูลส่วนตัว</Menu.Item>
          <Menu.Item key="history" icon={<HistoryOutlined />}>ประวัติการใช้งาน</Menu.Item>
          <Menu.Item key="bookings" icon={<CalendarOutlined />}>การจอง</Menu.Item>
          <Menu.Item key="payments" icon={<WalletOutlined />}>การชำระเงิน</Menu.Item>
          <Menu.Item key="messages" icon={<MessageOutlined />}>ข้อความ / การแจ้งเตือน</Menu.Item>
          <Menu.Item key="settings" icon={<SettingOutlined />}>การตั้งค่า</Menu.Item>
          <Menu.Item key="help" icon={<QuestionCircleOutlined />}>ช่วยเหลือ</Menu.Item>
          <Menu.Item key="logout" icon={<LogoutOutlined />} style={{ color:'#ff4d4f' }}>ออกจากระบบ</Menu.Item>
        </Menu>
      </Sider>

      {/* Main Content */}
      <Layout>
        <Content style={{ margin: '24px 16px', overflow: 'initial' }}>
          <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ display:'flex', flexDirection:'column', gap:24 }}>
            {renderContent()}
            <Divider/>
            <div style={{ textAlign:'center', marginTop:16 }}>
              <Text type="secondary">THAITOUR Dashboard © 2025</Text>
            </div>
          </motion.div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardProfile;

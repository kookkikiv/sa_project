// GuideRegistration.tsx
import React, { useState } from "react";
import {
  Form,
  Input,
  Row,
  Col,
  Select,
  Button,
  Upload,
  Typography,
  Card,
  Space,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  UploadOutlined,
  IdcardOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import bgImage from "../assets/bangkok-thailand.jpg";

const { Option } = Select;
const { Title, Text, Link } = Typography;

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
};

const itemVariants = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } };

const GuideRegistration: React.FC = () => {
  const [form] = Form.useForm();
  const [lightMode, setLightMode] = useState(false);

  const onFinish = (values: any) => console.log("Form values:", values);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 16px",
      }}
      onClick={() => setLightMode(true)} // click background to lighten entire card
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ width: "100%", maxWidth: 960 }}
      >
        <motion.div
          whileHover={{ scale: 1.02, boxShadow: "0 12px 40px rgba(0,0,0,0.15)" }}
          animate={{
            backgroundColor: lightMode ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.9)",
            filter: lightMode ? "brightness(1.5)" : "none",
          }}
          transition={{ duration: 0.3 }}
          style={{ borderRadius: 24 }}
          onClick={(e) => {
            e.stopPropagation(); // prevent triggering background click
            setLightMode(false); // click card to restore normal
          }}
        >
          <Card
            bordered={false}
            style={{
              borderRadius: 24,
              boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
              padding: "32px 28px",
              backgroundColor: "transparent", // motion.div handles color
            }}
          >
            {/* Title */}
            <motion.div variants={itemVariants}>
              <Title
                level={2}
                style={{
                  textAlign: "center",
                  marginBottom: 32,
                  fontWeight: 700,
                  color: "#1890ff",
                }}
              >
                🧭 Guide Registration
              </Title>
            </motion.div>

            <Form form={form} layout="vertical" onFinish={onFinish} size="large">
              {/* Personal Info */}
              <motion.div variants={itemVariants}>
                <Title level={4}>
                  <IdcardOutlined /> Personal Information
                </Title>
              </motion.div>

              <Row gutter={16}>
                <Col span={12}>
                  <motion.div variants={itemVariants}>
                    <Form.Item
                      label="First Name"
                      name="firstName"
                      rules={[{ required: true }]}
                      extra="As on your legal documents"
                    >
                      <Input placeholder="Enter first name" prefix={<UserOutlined />} />
                    </Form.Item>
                  </motion.div>
                </Col>
                <Col span={12}>
                  <motion.div variants={itemVariants}>
                    <Form.Item label="Last Name" name="lastName" rules={[{ required: true }]}>
                      <Input placeholder="Enter last name" prefix={<UserOutlined />} />
                    </Form.Item>
                  </motion.div>
                </Col>
              </Row>

              {/* Age & Gender */}
              <Row gutter={16}>
                <Col span={12}>
                  <motion.div variants={itemVariants}>
                    <Form.Item label="Age" name="age" rules={[{ required: true }]}>
                      <Input type="number" placeholder="Enter age" />
                    </Form.Item>
                  </motion.div>
                </Col>
                <Col span={12}>
                  <motion.div variants={itemVariants}>
                    <Form.Item label="Gender" name="gender" rules={[{ required: true }]}>
                      <Select placeholder="Select gender">
                        <Option value="male">Male</Option>
                        <Option value="female">Female</Option>
                        <Option value="other">Other</Option>
                      </Select>
                    </Form.Item>
                  </motion.div>
                </Col>
              </Row>

              {/* Phone & Email */}
              <Row gutter={16}>
                <Col span={12}>
                  <motion.div variants={itemVariants}>
                    <Form.Item label="Phone" name="phone" rules={[{ required: true }]}>
                      <Input placeholder="+66 8X-XXX-XXXX" prefix={<PhoneOutlined />} />
                    </Form.Item>
                  </motion.div>
                </Col>
                <Col span={12}>
                  <motion.div variants={itemVariants}>
                    <Form.Item
                      label="Email"
                      name="email"
                      rules={[{ required: true, type: "email" }]}
                    >
                      <Input placeholder="Enter email" prefix={<MailOutlined />} />
                    </Form.Item>
                  </motion.div>
                </Col>
              </Row>

              {/* Guide Details */}
              <motion.div variants={itemVariants}>
                <Title level={4} style={{ marginTop: 24 }}>
                  <EnvironmentOutlined /> Guide Details
                </Title>
              </motion.div>

              <Row gutter={16}>
                <Col span={12}>
                  <motion.div variants={itemVariants}>
                    <Form.Item
                      label="Guide Type"
                      name="GT"
                      rules={[{ required: true, message: "Please select a guide type" }]}
                    >
                      <Select placeholder="Select guide type">
                        <Option value="general">General Guide</Option>
                        <Option value="local">Local Guide</Option>
                      </Select>
                    </Form.Item>
                  </motion.div>
                </Col>
                <Col span={12}>
                  <motion.div variants={itemVariants}>
                    <Form.Item
                      label="Region"
                      name="RG"
                      rules={[{ required: true, message: "Please select a Region" }]}
                    >
                      <Select placeholder="Select Region">
                        <Option value="north">North</Option>
                        <Option value="south">South</Option>
                      </Select>
                    </Form.Item>
                  </motion.div>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <motion.div variants={itemVariants}>
                    <Form.Item
                      label="Province"
                      name="PV"
                      rules={[{ required: true, message: "Please select a Province" }]}
                    >
                      <Select placeholder="Select Province">
                        <Option value="chiangmai">Chiang Mai</Option>
                        <Option value="bangkok">Bangkok</Option>
                      </Select>
                    </Form.Item>
                  </motion.div>
                </Col>
                <Col span={12}>
                  <motion.div variants={itemVariants}>
                    <Form.Item
                      label="District"
                      name="DT"
                      rules={[{ required: true, message: "Please select a District" }]}
                    >
                      <Select placeholder="Select District">
                        <Option value="district1">District 1</Option>
                        <Option value="district2">District 2</Option>
                      </Select>
                    </Form.Item>
                  </motion.div>
                </Col>
              </Row>

              {/* Documents */}
              <motion.div variants={itemVariants}>
                <Title level={4} style={{ marginTop: 24 }}>
                  📑 Documents
                </Title>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Form.Item label="Upload relevant documents for consideration" name="documents">
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Text type="secondary">
                      You can see information&nbsp;
                      <Link href="/documents-info" target="_blank">
                        here
                      </Link>
                      .
                    </Text>
                    <Upload beforeUpload={() => false}>
                      <Button icon={<UploadOutlined />}>Click to Upload</Button>
                    </Upload>
                  </Space>
                </Form.Item>
              </motion.div>

              <motion.div variants={itemVariants} style={{ marginTop: 24 }}>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    size="large"
                    style={{
                      borderRadius: 12,
                      fontWeight: 600,
                      boxShadow: "0 6px 18px rgba(24, 144, 255, 0.4)",
                    }}
                  >
                    Submit Application
                  </Button>
                </motion.div>
              </motion.div>
            </Form>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default GuideRegistration;

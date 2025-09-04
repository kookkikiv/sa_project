// GuideRegistration.tsx
import React, { useState, useEffect } from "react";
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
  message,
  Spin,
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
import bgImage from "../../assets/bangkok-thailand.jpg";
import { useNavigate } from "react-router-dom";  // add this import

const { Option } = Select;
const { Title, Text, Link } = Typography;

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
};
const itemVariants = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } };

const API_URL = "http://localhost:8080";

const GuideRegistration: React.FC = () => {
  const [form] = Form.useForm();
  const [lightMode, setLightMode] = useState(false);
  const navigate = useNavigate();
  const [guideTypes, setGuideTypes] = useState<{ id: number; name: string }[]>([]);
  const [provinces, setProvinces] = useState<{ id: number; name: string }[]>([]);
  const [languages, setLanguages] = useState<{ id: number; name: string }[]>([]);
  const [districts, setDistricts] = useState<{ id: number; district: string }[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null);
  const [fileList, setFileList] = useState<any[]>([]);
  const [loadingGuideTypes, setLoadingGuideTypes] = useState(true);
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingLanguages, setLoadingLanguages] = useState(true);

  // Fetch guide types
  useEffect(() => {
    fetch(`${API_URL}/guide-types`)
      .then((res) => res.json())
      .then((data) => setGuideTypes(data.map((gt: any) => ({ id: gt.ID, name: gt.name }))))
      .finally(() => setLoadingGuideTypes(false));
  }, []);

  // Fetch provinces
  useEffect(() => {
    fetch(`${API_URL}/provinces`)
      .then((res) => res.json())
      .then((data) => setProvinces(data.map((p: any) => ({ id: p.ID, name: p.name }))))
      .finally(() => setLoadingProvinces(false));
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/languages`)
      .then((res) => res.json())
      .then((data) => setLanguages(data.map((l: any) => ({ id: l.ID, name: l.name }))))
      .finally(() => setLoadingLanguages(false));
  }, []);

  // Fetch districts when province changes
  useEffect(() => {
    if (!selectedProvinceId) {
      setDistricts([]);
      return;
    }
    setLoadingDistricts(true);
    fetch(`${API_URL}/service-areas/${selectedProvinceId}`)
      .then((res) => res.json())
      .then((data) =>
        setDistricts(data.map((d: any) => ({ id: d.ID, district: d.District || d.district })))
      )
      .finally(() => setLoadingDistricts(false));
  }, [selectedProvinceId]);

  const handleUpload = (file: any) => {
    setFileList([file]);
    return false;
  };

  const onFinish = async (values: any) => {
    try {
      if (!selectedProvinceId) {
        message.error("Please select a province.");
        return;
      }

      const serviceArea = districts.find((d) => d.id === values.district);
      if (!serviceArea) {
        message.error("Please select a valid district.");
        return;
      }

      let documentPath = "";
      if (fileList.length > 0) {
        const formData = new FormData();
        formData.append("file", fileList[0]);
        const uploadRes = await fetch(`${API_URL}/documents/upload`, {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed");
        documentPath = uploadData.data.DocumentPath;
      }

      const payload = {
        first_name: values.firstName,
        last_name: values.lastName,
        age: Number(values.age),
        sex: values.gender,
        phone: values.phone,
        email: values.email,
        language_id: Number(values.language),
        guide_type_id: values.guideTypeId,
        service_area_id: serviceArea.id,
        documents_path: documentPath,
        user_id: 1, // temporary since you have no login
      };

      const res = await fetch(`${API_URL}/guide-applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submit failed");

      message.success("Application submitted successfully!");
      form.resetFields();
      setFileList([]);
      setSelectedProvinceId(null);
      navigate(`/waiting-approval/${data.id}`);

    } catch (err: any) {
      console.error(err);
      message.error(err.message || "Failed to submit application.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 16px",
      }}
      onClick={() => setLightMode(true)}
    >
      <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ width: "100%", maxWidth: 960 }}>
        <motion.div
          whileHover={{ scale: 1.02, boxShadow: "0 12px 40px rgba(0,0,0,0.15)" }}
          animate={{
            backgroundColor: lightMode ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.9)",
            filter: lightMode ? "brightness(1.5)" : "none",
          }}
          transition={{ duration: 0.3 }}
          style={{ borderRadius: 24 }}
          onClick={(e) => { e.stopPropagation(); setLightMode(false); }}
        >
          <Card bordered={false} style={{ borderRadius: 24, boxShadow: "0 8px 30px rgba(0,0,0,0.1)", padding: "32px 28px", backgroundColor: "transparent" }}>
            <motion.div variants={itemVariants}>
              <Title level={2} style={{ textAlign: "center", marginBottom: 32, fontWeight: 700, color: "#1890ff" }}>
                🧭 Guide Registration
              </Title>
            </motion.div>

            <Form form={form} layout="vertical" onFinish={onFinish} size="large">
              {/* Personal Info */}
              <motion.div variants={itemVariants}>
                <Title level={4}><IdcardOutlined /> Personal Information</Title>
              </motion.div>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="First Name" name="firstName" rules={[{ required: true }]}>
                    <Input placeholder="Enter first name" prefix={<UserOutlined />} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Last Name" name="lastName" rules={[{ required: true }]}>
                    <Input placeholder="Enter last name" prefix={<UserOutlined />} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Age" name="age" rules={[{ required: true }]}>
                    <Input type="number" placeholder="Enter age" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Gender" name="gender" rules={[{ required: true }]}>
                    <Select placeholder="Select gender">
                      <Option value="male">Male</Option>
                      <Option value="female">Female</Option>
                      <Option value="other">Other</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Phone" name="phone" rules={[{ required: true }]}>
                    <Input placeholder="+66 8X-XXX-XXXX" prefix={<PhoneOutlined />} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Email" name="email" rules={[{ required: true, type: "email" }]}>
                    <Input placeholder="Enter email" prefix={<MailOutlined />} />
                  </Form.Item>
                </Col>
              </Row>

              {/* Guide Details */}
              <motion.div variants={itemVariants}>
                <Title level={4} style={{ marginTop: 24 }}><EnvironmentOutlined /> Guide Details</Title>
              </motion.div>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Guide Type" name="guideTypeId" rules={[{ required: true }]}>
                    {loadingGuideTypes ? <Spin /> : (
                      <Select placeholder="Select guide type">
                        {guideTypes.map(gt => <Option key={gt.id} value={gt.id}>{gt.name}</Option>)}
                      </Select>
                    )}
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Province" name="provinceId" rules={[{ required: true }]}>
                    {loadingProvinces ? <Spin /> : (
                      <Select placeholder="Select province" onChange={(value) => setSelectedProvinceId(value)}>
                        {provinces.map(p => <Option key={p.id} value={p.id}>{p.name}</Option>)}
                      </Select>
                    )}
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="District" name="district" rules={[{ required: true }]}>
                    {loadingDistricts ? <Spin /> : (
                      <Select placeholder="Select district">
                        {districts.map(d => <Option key={d.id} value={d.id}>{d.district}</Option>)}
                      </Select>
                    )}
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Language" name="language" rules={[{ required: true }]}>
                    {loadingLanguages ? <Spin /> : (
                      <Select placeholder="Select language">
                        {languages.map(l => <Option key={l.id} value={l.id}>{l.name}</Option>)}
                      </Select>
                    )}
                  </Form.Item>
                </Col>
              </Row>

              

              {/* Documents */}
              <motion.div variants={itemVariants}>
                <Title level={4} style={{ marginTop: 24 }}>📑 Documents</Title>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Form.Item label="Upload relevant documents for consideration" name="documents">
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Text type="secondary">
                      You can see information&nbsp;
                      <Link href="/documents-info" target="_blank">here</Link>.
                    </Text>
                    <Upload fileList={fileList} beforeUpload={handleUpload} onRemove={() => setFileList([])}>
                      <Button icon={<UploadOutlined />}>Click to Upload</Button>
                    </Upload>
                  </Space>
                </Form.Item>
              </motion.div>

              <motion.div variants={itemVariants} style={{ marginTop: 24 }}>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button type="primary" htmlType="submit" block size="large"
                    style={{ borderRadius: 12, fontWeight: 600, boxShadow: "0 6px 18px rgba(24, 144, 255, 0.4)" }}>
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
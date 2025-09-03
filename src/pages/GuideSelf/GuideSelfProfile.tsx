import React, { useState } from "react";
import {
  Card, Descriptions, Tag, Button, Modal,
  Form, Input, Select, message, Upload, List, Rate, Avatar
} from "antd";
import { UploadOutlined, UserOutlined } from "@ant-design/icons";

const { Option } = Select;

interface GuideProfile {
  id: number;
  name: string;
  age: number;
  sex: string;
  phone: string;
  email: string;
  guideType: string;
  languages: string[];
  serviceAreas: string[];
  status: string; // Active
  documentsPath?: string;
  avatar?: string; // ✅ เพิ่มรูปไกด์
}

interface Review {
  id: number;
  reviewer: string;
  rating: number;
  comment: string;
  date: string;
  avatar?: string; // ✅ เพิ่มรูปผู้รีวิว
}

const GuideSelfProfile: React.FC = () => {
  const [profile] = useState<GuideProfile>({
    id: 5001,
    name: "สมชาย ใจดี",
    age: 28,
    sex: "ชาย",
    phone: "0888888888",
    email: "guide01@gmail.com",
    guideType: "Local Guide",
    languages: ["อังกฤษ", "จีน"],
    serviceAreas: ["กรุงเทพฯ", "อยุธยา"],
    status: "Active",
    documentsPath: "/files/guide5001.pdf",
    avatar: "https://i.pravatar.cc/150?img=12", // mock รูปไกด์
  });

  const [reviews] = useState<Review[]>([
    {
      id: 1,
      reviewer: "คุณเอ",
      rating: 5,
      comment: "ไกด์อธิบายละเอียด บริการดีมาก",
      date: "2025-08-20",
      avatar: "https://i.pravatar.cc/100?img=1",
    },
    {
      id: 2,
      reviewer: "คุณบี",
      rating: 4,
      comment: "พูดภาษาอังกฤษคล่อง แต่รถมาช้านิดหน่อย",
      date: "2025-08-25",
      avatar: "https://i.pravatar.cc/100?img=2",
    },
    {
      id: 3,
      reviewer: "คุณซี",
      rating: 5,
      comment: "บริการดีเยี่ยม แนะนำสถานที่น่าสนใจ",
      date: "2025-09-01",
      avatar: "https://i.pravatar.cc/100?img=3",
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [form] = Form.useForm();

  const handleSubmitRequest = () => {
    form.validateFields().then((values) => {
      console.log("ส่งคำร้องแก้ไข:", values);
      message.success("ส่งคำร้องแก้ไขเรียบร้อย รอแอดมินตรวจสอบ");
      setIsModalOpen(false);
      form.resetFields();
      setSelectedField(null);
    });
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      {/* ✅ โปรไฟล์ */}
      <Card
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar size={64} src={profile.avatar} icon={<UserOutlined />} />
            <span>{profile.name}</span>
          </div>
        }
      >
        <Descriptions bordered column={1}>
          <Descriptions.Item label="รหัส">{profile.id}</Descriptions.Item>
          <Descriptions.Item label="ชื่อ-นามสกุล">{profile.name}</Descriptions.Item>
          <Descriptions.Item label="อายุ">{profile.age}</Descriptions.Item>
          <Descriptions.Item label="เพศ">{profile.sex}</Descriptions.Item>
          <Descriptions.Item label="เบอร์โทร">{profile.phone}</Descriptions.Item>
          <Descriptions.Item label="อีเมล">{profile.email}</Descriptions.Item>
          <Descriptions.Item label="ประเภทไกด์">{profile.guideType}</Descriptions.Item>
          <Descriptions.Item label="ภาษา">{profile.languages.join(", ")}</Descriptions.Item>
          <Descriptions.Item label="พื้นที่บริการ">{profile.serviceAreas.join(", ")}</Descriptions.Item>
          <Descriptions.Item label="เอกสารแนบ">
            {profile.documentsPath ? (
              <a href={profile.documentsPath} target="_blank" rel="noopener noreferrer">
                ดูเอกสาร
              </a>
            ) : (
              "ไม่มี"
            )}
          </Descriptions.Item>
          <Descriptions.Item label="สถานะ">
            {profile.status === "Active" && <Tag color="green">อนุมัติแล้ว</Tag>}
          </Descriptions.Item>
        </Descriptions>

        <div style={{ marginTop: 20, textAlign: "right" }}>
          <Button type="primary" onClick={() => setIsModalOpen(true)}>
            ส่งคำร้องแก้ไข
          </Button>
        </div>
      </Card>

      {/* ✅ รีวิว */}
      <Card title="รีวิวจากลูกค้า" style={{ marginTop: 24 }}>
        <List
          itemLayout="vertical"
          dataSource={reviews}
          renderItem={(review) => (
            <List.Item key={review.id}>
              <List.Item.Meta
                avatar={<Avatar src={review.avatar} />}
                title={
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>{review.reviewer}</span>
                    <span style={{ fontSize: "0.9em", color: "gray" }}>{review.date}</span>
                  </div>
                }
                description={<Rate disabled defaultValue={review.rating} />}
              />
              <p>{review.comment}</p>
            </List.Item>
          )}
        />
      </Card>

      {/* ✅ Modal ส่งคำร้องแก้ไข */}
      <Modal
        title="ส่งคำร้องแก้ไขโปรไฟล์"
        open={isModalOpen}
        onOk={handleSubmitRequest}
        onCancel={() => setIsModalOpen(false)}
        okText="ส่งคำร้อง"
        cancelText="ยกเลิก"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="field"
            label="เลือกข้อมูลที่ต้องการแก้ไข"
            rules={[{ required: true, message: "กรุณาเลือกข้อมูล" }]}
          >
            <Select
              placeholder="เลือกข้อมูล"
              onChange={(val) => setSelectedField(val)}
            >
              <Option value="phone">เบอร์โทร</Option>
              <Option value="email">อีเมล</Option>
              <Option value="languages">ภาษา</Option>
              <Option value="serviceAreas">พื้นที่บริการ</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="newValue"
            label="ค่าที่ต้องการแก้ไข"
            rules={[{ required: true, message: "กรุณากรอกข้อมูลใหม่" }]}
          >
            <Input placeholder="กรอกข้อมูลใหม่" />
          </Form.Item>

          {selectedField === "languages" && (
            <Form.Item
              name="certificate"
              label="ใบรับรองภาษา"
              rules={[{ required: true, message: "กรุณาอัปโหลดใบรับรองภาษา" }]}
            >
              <Upload beforeUpload={() => false} maxCount={1}>
                <Button icon={<UploadOutlined />}>อัปโหลดไฟล์</Button>
              </Upload>
            </Form.Item>
          )}

          <Form.Item name="reason" label="เหตุผล (ถ้ามี)">
            <Input.TextArea rows={3} placeholder="อธิบายเหตุผลที่ต้องการแก้ไข" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GuideSelfProfile;

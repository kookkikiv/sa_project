import { useEffect, useState } from "react";
import {
  Space, Button, Col, Row, Divider, Form, Input, Card, message, Select,
  InputNumber, Upload, Image
} from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import { SaveOutlined, InboxOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate, Link, useParams } from "react-router-dom";

import { GetAccommodation, GetRoomById, UpdateRoomById } from "../../../services/https";

// ====== ตั้งค่าอัปโหลดรูป ======
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const API_UPLOAD_ENDPOINT = `${API_BASE_URL}/api/v1/pictures/upload`;
const getAuthHeaderOnly = (): Record<string, string> => {
  const token = localStorage.getItem("token");
  const tokenType = localStorage.getItem("token_type");
  if (!token || !tokenType) return {};
  return { Authorization: `${tokenType} ${token}` };
};

// ====== Types ======
type AccommodationLite = { ID: number; Name?: string; name?: string };
type RoomForm = {
  AccommodationID?: number;
  Name?: string;
  Type?: string;
  BedType?: string;
  Price?: number;
  People?: number;
  Status?: string;
};

// ====== helpers ======
const asArray = <T,>(val: any): T[] =>
  Array.isArray(val) ? (val as T[])
  : Array.isArray(val?.data) ? (val.data as T[])
  : Array.isArray(val?.items) ? (val.items as T[])
  : [];

export default function RoomEdit() {
  const { id } = useParams(); // /accommodation/room/edit/:id (ตัวอย่าง)
  const navigate = useNavigate();
  const [form] = Form.useForm<RoomForm>();
  const [messageApi, contextHolder] = message.useMessage();

  const [accommodations, setAccommodations] = useState<AccommodationLite[]>([]);
  const [loadingAcc, setLoadingAcc] = useState(false);

  // รูป
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [pictureUrls, setPictureUrls] = useState<string[]>([]);
  const [addingUrl, setAddingUrl] = useState("");

  const ROOM_TYPES = [
    { value: "standard", label: "ห้องมาตรฐาน" },
    { value: "suite", label: "ห้องสวีท" },
    { value: "family", label: "ห้องครอบครัว" },
  ];
  const BED_TYPES = [
    { value: "single", label: "เตียงเดี่ยว" },
    { value: "double", label: "เตียงคู่" },
    { value: "twin", label: "เตียงคู่แยก" },
    { value: "king", label: "คิงไซส์" },
  ];
  const ROOM_STATUS = [
    { value: "open", label: "เปิดให้บริการ" },
    { value: "closed", label: "ปิดปรับปรุง" },
  ];

  // โหลดที่พักให้เลือก
  const fetchAccommodations = async () => {
    setLoadingAcc(true);
    try {
      const res = await GetAccommodation();
      setAccommodations(asArray<AccommodationLite>(res?.data));
    } catch {
      setAccommodations([]);
      messageApi.error("โหลดรายชื่อที่พักไม่สำเร็จ");
    } finally {
      setLoadingAcc(false);
    }
  };

  // โหลดข้อมูลเดิมของห้อง
  const loadRoom = async () => {
    if (!id) return;
    try {
      const res = await GetRoomById(id);
      const data = res?.data?.data || res?.data;

      // สมมติ data โครงสร้าง:
      // { id, name, type, bed_type, price, people, status, accommodation_id, Pictures: [{Url: "..."}] }
      const initial: RoomForm = {
        AccommodationID: data?.accommodation_id ?? data?.AccommodationID,
        Name: data?.name ?? data?.Name,
        Type: data?.type ?? data?.Type,
        BedType: data?.bed_type ?? data?.BedType,
        Price: data?.price ?? data?.Price,
        People: data?.people ?? data?.People,
        Status: data?.status ?? data?.Status,
      };
      form.setFieldsValue(initial);

      const urls: string[] =
        Array.isArray(data?.picture_urls) ? data.picture_urls :
        Array.isArray(data?.Pictures) ? data.Pictures.map((p: any) => p.Url || p.url).filter(Boolean) :
        Array.isArray(data?.pictures) ? data.pictures.map((p: any) => p.url || p.Url).filter(Boolean) : [];

      setPictureUrls(urls);
      setFileList(urls.map((u: string, i: number) => ({
        uid: `init-${i}`,
        name: u.split("/").pop() || `image-${i + 1}`,
        status: "done",
        url: u,
      })));
    } catch {
      messageApi.error("โหลดข้อมูลห้องไม่สำเร็จ");
    }
  };

  useEffect(() => { void fetchAccommodations(); }, []);
  useEffect(() => { void loadRoom(); /* eslint-disable-next-line */ }, [id]);

  // upload helpers
  const beforeUpload = (file: File) => {
    const isImage = /image\/(jpeg|png|webp|gif)/.test(file.type);
    if (!isImage) { messageApi.error("อัปโหลดได้เฉพาะ jpg/png/webp/gif"); return Upload.LIST_IGNORE; }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) { messageApi.error("ขนาดไฟล์ต้องน้อยกว่า 5MB"); return Upload.LIST_IGNORE; }
    return true;
  };

  const addPictureUrlManually = () => {
    const trimmed = addingUrl.trim();
    if (!trimmed) return;
    try {
      new URL(trimmed);
      if (pictureUrls.includes(trimmed)) { messageApi.warning("เพิ่มซ้ำแล้ว"); return; }
      setPictureUrls(prev => [...prev, trimmed]);
      setFileList(prev => [...prev, { uid: `url-${Date.now()}`, name: trimmed.split("/").pop() || "image", status: "done", url: trimmed }]);
      setAddingUrl("");
    } catch {
      messageApi.error("รูปแบบ URL ไม่ถูกต้อง");
    }
  };

  const onFinish = async (values: RoomForm) => {
    try {
      const adminId = localStorage.getItem("id");
      const payload = {
        accommodation_id: values.AccommodationID,
        name: values.Name,
        type: values.Type,
        bed_type: values.BedType,
        price: values.Price,
        people: values.People,
        status: values.Status,
        admin_id: adminId ? parseInt(adminId, 10) : undefined,
        picture_urls: pictureUrls,
      };
      const res = await UpdateRoomById(id!, payload);
      if (res?.status === 200) {
        messageApi.success(res?.data?.message ?? "อัปเดตสำเร็จ");
        navigate("/accommodation/room");
      } else {
        messageApi.error(res?.data?.error ?? "อัปเดตไม่สำเร็จ");
      }
    } catch {
      messageApi.error("เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
    }
  };

  return (
    <div>
      {contextHolder}
      <Card>
        <h2>แก้ไขข้อมูลห้องพัก</h2>
        <Divider />
        <Form form={form} name="room-edit" layout="vertical" onFinish={onFinish} autoComplete="off">
          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              <Form.Item label="สถานที่พัก" name="AccommodationID"
                rules={[{ required: true, message: "กรุณาเลือกสถานที่พัก !" }]}>
                <Select placeholder="เลือกที่พัก" allowClear showSearch loading={loadingAcc}
                  optionFilterProp="label" optionLabelProp="label"
                  options={(accommodations ?? []).map(a => ({
                    value: Number(a.ID), label: a.Name || a.name || `ที่พัก #${a.ID}`
                  }))} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="ชื่อห้องพัก" name="Name"
                rules={[{ required: true, message: "กรุณากรอกชื่อห้องพัก !" }]}>
                <Input placeholder="เช่น ห้อง 101 / Deluxe 1" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="ลักษณะห้อง" name="Type"
                rules={[{ required: true, message: "กรุณาเลือกลักษณะห้อง !" }]}>
                <Select placeholder="เลือกประเภทห้อง" allowClear showSearch optionFilterProp="label"
                  options={ROOM_TYPES} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="ลักษณะเตียง" name="BedType"
                rules={[{ required: true, message: "กรุณาเลือกลักษณะเตียง !" }]}>
                <Select placeholder="เลือกประเภทเตียง" allowClear showSearch optionFilterProp="label"
                  options={BED_TYPES} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="ราคา (บาท/คืน)" name="Price"
                rules={[{ required: true, message: "กรุณาระบุราคา !" }]}>
                <InputNumber min={0} step={100} style={{ width: "100%" }} placeholder="เช่น 1200" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="จำนวนคนพักได้" name="People"
                rules={[{ required: true, message: "กรุณาระบุจำนวนคน !" }]}>
                <InputNumber min={1} max={10} style={{ width: "100%" }} placeholder="เช่น 2" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="สถานะห้องพัก" name="Status"
                rules={[{ required: true, message: "กรุณาเลือกสถานะห้องพัก !" }]}>
                <Select placeholder="เลือกสถานะห้องพัก" allowClear showSearch optionFilterProp="label"
                  options={ROOM_STATUS} />
              </Form.Item>
            </Col>

            {/* รูปภาพห้อง */}
            <Col span={24}>
              <Divider />
              <h3 style={{ marginBottom: 8 }}>รูปภาพห้องพัก</h3>
              <Upload.Dragger
                name="file"
                multiple
                listType="picture-card"
                action={API_UPLOAD_ENDPOINT}
                headers={getAuthHeaderOnly()}
                beforeUpload={beforeUpload}
                fileList={fileList}
                onChange={({ file, fileList: fl }) => {
                  setFileList(fl);
                  if (file.status === "done") {
                    const url =
                      (file.response && (file.response.url || file.response.data?.url)) ??
                      (Array.isArray(file.response?.urls) ? file.response.urls[0] : undefined);
                    if (url) {
                      setPictureUrls(prev => (prev.includes(url) ? prev : [...prev, url]));
                      messageApi.success("อัปโหลดรูปสำเร็จ");
                    } else {
                      messageApi.warning("อัปโหลดสำเร็จแต่ไม่พบ URL ที่ส่งกลับ");
                      console.debug("upload response:", file.response);
                    }
                  } else if (file.status === "error") {
                    messageApi.error("อัปโหลดรูปไม่สำเร็จ");
                  }
                }}
                onRemove={(file) => {
                  const url = (file.url as string) ||
                    (file.response?.url as string) ||
                    (file.response?.data?.url as string);
                  if (url) setPictureUrls(prev => prev.filter(u => u !== url));
                  return true;
                }}
                accept="image/png,image/jpeg,image/webp,image/gif"
              >
                <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                <p className="ant-upload-text">ลากไฟล์มาวาง หรือคลิกเพื่อเลือกไฟล์รูป</p>
                <p className="ant-upload-hint">รองรับ jpg, png, webp, gif ขนาดไม่เกิน 5MB</p>
              </Upload.Dragger>

              {/* เพิ่มจากลิงก์เอง */}
              <Row gutter={8} style={{ marginTop: 12 }}>
                <Col flex="auto">
                  <Input placeholder="วางลิงก์รูปภาพ เช่น https://.../image.jpg"
                    value={addingUrl} onChange={e => setAddingUrl(e.target.value)}
                    onPressEnter={addPictureUrlManually} />
                </Col>
                <Col><Button onClick={addPictureUrlManually}>เพิ่มลิงก์</Button></Col>
              </Row>

              {/* Preview */}
              {pictureUrls.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <Image.PreviewGroup>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {pictureUrls.map(u => (
                        <div key={u} style={{
                          position: "relative", width: 120, height: 90, borderRadius: 8,
                          overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,.12)"
                        }}>
                          <Image src={u} alt="preview" width={120} height={90} style={{ objectFit: "cover" }} />
                          <Button size="small" danger type="primary" icon={<DeleteOutlined />}
                            onClick={() => {
                              setPictureUrls(prev => prev.filter(x => x !== u));
                              setFileList(prev => prev.filter(x => x.url !== u));
                            }}
                            style={{ position: "absolute", top: 4, right: 4 }} />
                        </div>
                      ))}
                    </div>
                  </Image.PreviewGroup>
                </div>
              )}
            </Col>
          </Row>

          <Row justify="end">
            <Col style={{ marginTop: 32 }}>
              <Form.Item>
                <Space>
                  <Link to="/accommodation/room"><Button htmlType="button">ยกเลิก</Button></Link>
                  <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>บันทึกการแก้ไข</Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
}

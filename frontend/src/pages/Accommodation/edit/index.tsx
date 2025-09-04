import {
  Space, Button, Col, Row, Divider, Form, Input, Card, message, Select, Upload, Image,
} from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import { useState, useEffect } from "react";
import {  InboxOutlined, DeleteOutlined, SaveOutlined } from "@ant-design/icons";
import { useNavigate, Link, useParams } from "react-router-dom";

import {
  GetProvince, GetDistrict, GetSubdistrict,
  // ใหม่:
  GetAccommodationById, UpdateAccommodationById,
} from "../../../services/https";

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
type BaseLoc = {
  ID: number | string;
  districtNameTh?: string; districtNameEn?: string;
  provinceNameTh?: string; provinceNameEn?: string;
  subdistrictNameTh?: string; subdistrictNameEn?: string;
  Name?: string; NameTh?: string; NameEn?: string; NameEN?: string;
  ProvinceName?: string; province_name?: string;
  DistrictName?: string; district_name?: string;
  SubdistrictName?: string; subdistrict_name?: string;
};

type Province = BaseLoc;
type District = BaseLoc & { ProvinceID?: number };
type Subdistrict = BaseLoc & { DistrictID?: number };

type AccommodationForm = {
  Name?: string;
  Type?: string;
  Status?: string;
  ProvinceID?: number;
  DistrictID?: number;
  SubdistrictID?: number;
};

// ====== helpers ======
const getDisplayName = (o: BaseLoc) =>
  o?.districtNameTh || o?.districtNameEn ||
  o?.provinceNameTh || o?.provinceNameEn ||
  o?.subdistrictNameTh || o?.subdistrictNameEn ||
  o?.NameTh || o?.NameEN || o?.NameEn || o?.Name ||
  o?.ProvinceName || o?.province_name ||
  o?.DistrictName || o?.district_name ||
  o?.SubdistrictName || o?.subdistrict_name ||
  String(o?.ID ?? "");

const toOptions = (items: BaseLoc[]) =>
  (items ?? []).map((it) => ({ value: Number(it.ID), label: getDisplayName(it) }));

const asArray = <T,>(val: any): T[] =>
  Array.isArray(val) ? (val as T[]) :
  Array.isArray(val?.data) ? (val.data as T[]) :
  Array.isArray(val?.items) ? (val.items as T[]) : [];

// ====== อัปโหลดไฟล์ไป backend เพื่อให้ได้ URL ======
async function uploadImageToServer(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch(API_UPLOAD_ENDPOINT, {
    method: "POST",
    headers: { ...getAuthHeaderOnly() },
    body: fd,
  });

  const json = await res.json().catch(() => ({}));
  const url = json?.url || json?.data?.url;
  if (!res.ok || !url) throw new Error(json?.error || "อัปโหลดรูปไม่สำเร็จ");
  return url as string;
}

export default function AccommodationEdit() {
  const { id } = useParams(); // /accommodation/edit/:id
  const navigate = useNavigate();
  const [form] = Form.useForm<AccommodationForm>();
  const [messageApi, contextHolder] = message.useMessage();

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [subdistricts, setSubdistricts] = useState<Subdistrict[]>([]);

  const [loadingProvince, setLoadingProvince] = useState(false);
  const [loadingDistrict, setLoadingDistrict] = useState(false);
  const [loadingSubdistrict, setLoadingSubdistrict] = useState(false);

  const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);

  // รูปภาพ
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [pictureUrls, setPictureUrls] = useState<string[]>([]);
  const [addingUrl, setAddingUrl] = useState<string>("");

  // ------- Fetchers -------
  const fetchProvinces = async () => {
    setLoadingProvince(true);
    try {
      const res = await GetProvince();
      setProvinces(asArray<Province>(res?.data));
    } catch {
      setProvinces([]);
      messageApi.error("โหลดรายชื่อจังหวัดไม่สำเร็จ");
    } finally {
      setLoadingProvince(false);
    }
  };

  const fetchDistricts = async (provinceId: number) => {
    setLoadingDistrict(true);
    try {
      const res = await GetDistrict(provinceId);
      setDistricts(asArray<District>(res?.data));
    } catch {
      setDistricts([]);
      messageApi.error("โหลดรายชื่ออำเภอไม่สำเร็จ");
    } finally {
      setLoadingDistrict(false);
    }
  };

  const fetchSubdistricts = async (districtId: number) => {
    setLoadingSubdistrict(true);
    try {
      const res = await GetSubdistrict(districtId);
      setSubdistricts(asArray<Subdistrict>(res?.data));
    } catch {
      setSubdistricts([]);
      messageApi.error("โหลดรายชื่อตำบลไม่สำเร็จ");
    } finally {
      setLoadingSubdistrict(false);
    }
  };

  // โหลดจังหวัดทั้งหมดก่อน
  useEffect(() => { void fetchProvinces(); }, []);

  // โหลดข้อมูลเดิมของที่พัก
  useEffect(() => {
  const load = async () => {
    if (!id) return;
    try {
      const res = await GetAccommodationById(id);     // ✅ ส่ง string ได้เลย
      const data = res?.data?.data;                   // ✅ อ่านชั้นที่ถูกต้อง

      const initial = {
        Name: data?.name ?? data?.Name ?? "",
        Type: data?.type ?? data?.Type ?? undefined,
        Status: data?.status ?? data?.Status ?? undefined,
        ProvinceID: data?.province_id ?? data?.ProvinceID ?? undefined,
        DistrictID: data?.district_id ?? data?.DistrictID ?? undefined,
        SubdistrictID: data?.subdistrict_id ?? data?.SubdistrictID ?? undefined,
      };
      form.setFieldsValue(initial);

      if (initial.ProvinceID) {
        setSelectedProvince(initial.ProvinceID);
        await fetchDistricts(initial.ProvinceID);
      }
      if (initial.DistrictID) {
        setSelectedDistrict(initial.DistrictID);
        await fetchSubdistricts(initial.DistrictID);
      }

      // รูปจาก Pictures หรือ picture_urls
      const urls: string[] =
        Array.isArray(data?.picture_urls) ? data.picture_urls :
        Array.isArray(data?.Pictures) ? data.Pictures.map((p: any) => p.Url || p.url).filter(Boolean) :
        Array.isArray(data?.pictures) ? data.pictures.map((p: any) => p.url || p.Url).filter(Boolean) : [];

      setPictureUrls(urls);
      setFileList(urls.map((u: string, i: number) => ({
        uid: `init-${i}`, name: u.split("/").pop() || `image-${i+1}`, status: "done", url: u,
      })));
    } catch (e) {
      messageApi.error("โหลดข้อมูลที่พักไม่สำเร็จ");
    }
  };
  void load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [id]);


  // ====== อัปโหลดไฟล์ (antd Dragger) ======
  const beforeUpload = (file: File) => {
    const isImage = /image\/(jpeg|png|webp|gif)/.test(file.type);
    if (!isImage) {
      messageApi.error("อัปโหลดได้เฉพาะไฟล์รูป (jpg, png, webp, gif)");
      return Upload.LIST_IGNORE;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      messageApi.error("ขนาดไฟล์ต้องน้อยกว่า 5MB");
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  // ------- Submit -------
  const onFinish = async (values: AccommodationForm) => {
    try {
      const adminId = localStorage.getItem("id");
      const payload: any = {
        Name: values.Name,
        Type: values.Type,
        Status: values.Status,
        province_id: values.ProvinceID,
        district_id: values.DistrictID,
        subdistrict_id: values.SubdistrictID,
        admin_id: adminId ? parseInt(adminId, 10) : undefined,
        picture_urls: pictureUrls, // ส่งรูปที่เหลืออยู่/เพิ่มใหม่
      };

      const res = await UpdateAccommodationById(id!, payload);
      if (res?.status === 200) {
        messageApi.success(res?.data?.message ?? "อัปเดตข้อมูลสำเร็จ");
        navigate("/accommodation");
      } else {
        messageApi.error(res?.data?.error ?? "อัปเดตไม่สำเร็จ");
      }
    } catch {
      messageApi.error("เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
    }
  };

  const addPictureUrlManually = () => {
    const trimmed = (addingUrl || "").trim();
    if (!trimmed) return;
    try {
      new URL(trimmed);
      if (pictureUrls.includes(trimmed)) {
        messageApi.warning("เพิ่มซ้ำแล้ว");
        return;
      }
      setPictureUrls((prev) => [...prev, trimmed]);
      const fake: UploadFile = {
        uid: `url-${Date.now()}`,
        name: trimmed.split("/").pop() || "image",
        status: "done",
        url: trimmed,
      };
      setFileList((prev) => [...prev, fake]);
      setAddingUrl("");
    } catch {
      messageApi.error("รูปแบบ URL ไม่ถูกต้อง");
    }
  };

  return (
    <div>
      {contextHolder}
      <Card>
        <h2>แก้ไขข้อมูลที่พัก</h2>
        <Divider />
        <Form
          form={form}
          name="accommodation-edit"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Row gutter={[16, 0]}>
            {/* ชื่อที่พัก */}
            <Col xs={24} md={12}>
              <Form.Item
                label="ชื่อที่พัก"
                name="Name"
                rules={[{ required: true, message: "กรุณากรอกชื่อที่พัก !" }]}
              >
                <Input placeholder="เช่น โรงแรม ABC" />
              </Form.Item>
            </Col>

            {/* ลักษณะที่พัก */}
            <Col xs={24} md={12}>
              <Form.Item
                label="ลักษณะที่พัก"
                name="Type"
                rules={[{ required: true, message: "กรุณาเลือกลักษณะที่พัก !" }]}
              >
                <Select
                  placeholder="เลือกประเภทที่พัก"
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  options={[
                    { value: "hotel",  label: "โรงแรม" },
                    { value: "resort", label: "รีสอร์ท" },
                    { value: "hostel", label: "โฮสเทล" },
                  ]}
                />
              </Form.Item>
            </Col>

            {/* สถานะที่พัก */}
            <Col xs={24} md={12}>
              <Form.Item
                label="สถานะที่พัก"
                name="Status"
                rules={[{ required: true, message: "กรุณาเลือกสถานะที่พัก !" }]}
              >
                <Select
                  placeholder="เลือกสถานะ"
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  options={[
                    { value: "open",   label: "เปิดให้บริการ" },
                    { value: "closed", label: "ปิดปรับปรุง" },
                  ]}
                />
              </Form.Item>
            </Col>

            {/* จังหวัด */}
            <Col xs={24} md={12}>
              <Form.Item
                label="จังหวัด"
                name="ProvinceID"
                rules={[{ required: true, message: "กรุณาเลือกจังหวัด !" }]}
              >
                <Select
                  placeholder="เลือกจังหวัด"
                  allowClear
                  showSearch
                  loading={loadingProvince}
                  options={toOptions(provinces)}
                  optionFilterProp="label"
                  onChange={async (value?: number) => {
                    setSelectedProvince(value ?? null);
                    setSelectedDistrict(null);
                    setSubdistricts([]);
                    form.setFieldsValue({ DistrictID: undefined, SubdistrictID: undefined });
                    if (typeof value === "number") await fetchDistricts(value);
                    else setDistricts([]);
                  }}
                />
              </Form.Item>
            </Col>

            {/* อำเภอ */}
            <Col xs={24} md={12}>
              <Form.Item
                label="อำเภอ"
                name="DistrictID"
                rules={[{ required: true, message: "กรุณาเลือกอำเภอ !" }]}
              >
                <Select
                  placeholder="เลือกอำเภอ"
                  allowClear
                  disabled={!selectedProvince}
                  showSearch
                  loading={loadingDistrict}
                  options={toOptions(districts)}
                  optionFilterProp="label"
                  onChange={async (value?: number) => {
                    setSelectedDistrict(value ?? null);
                    form.setFieldsValue({ SubdistrictID: undefined });
                    if (typeof value === "number") await fetchSubdistricts(value);
                    else setSubdistricts([]);
                  }}
                />
              </Form.Item>
            </Col>

            {/* ตำบล */}
            <Col xs={24} md={12}>
              <Form.Item
                label="ตำบล"
                name="SubdistrictID"
                rules={[{ required: true, message: "กรุณาเลือกตำบล !" }]}
              >
                <Select
                  placeholder="เลือกตำบล"
                  allowClear
                  disabled={!selectedDistrict}
                  showSearch
                  loading={loadingSubdistrict}
                  options={toOptions(subdistricts)}
                  optionFilterProp="label"
                />
              </Form.Item>
            </Col>

            {/* ====== ส่วนรูปภาพ ====== */}
            <Col span={24}>
              <Divider />
              <h3 style={{ marginBottom: 8 }}>รูปภาพที่พัก</h3>

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
                      setPictureUrls((prev) => (prev.includes(url) ? prev : [...prev, url]));
                      messageApi.success("อัปโหลดรูปสำเร็จ");
                    } else {
                      messageApi.warning("อัปโหลดสำเร็จแต่ไม่พบ URL ที่ส่งกลับ");
                      console.debug("upload response:", file.response);
                    }
                  } else if (file.status === "error") {
                    messageApi.error("อัปโหลดรูปไม่สำเร็จ");
                    console.error("upload error:", file.error || file.response);
                  }
                }}
                onRemove={(file) => {
                  const url =
                    (file.url as string) ||
                    (file.response?.url as string) ||
                    (file.response?.data?.url as string);
                  if (url) setPictureUrls((prev) => prev.filter((u) => u !== url));
                  return true;
                }}
                accept="image/png,image/jpeg,image/webp,image/gif"
              >
                <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                <p className="ant-upload-text">ลากไฟล์มาวาง หรือคลิกเพื่อเลือกไฟล์รูป</p>
                <p className="ant-upload-hint">รองรับ jpg, png, webp, gif ขนาดไม่เกิน 5MB</p>
              </Upload.Dragger>

              {/* เพิ่มจากลิงก์รูปเอง */}
              <Row gutter={8} style={{ marginTop: 12 }}>
                <Col flex="auto">
                  <Input
                    placeholder="วางลิงก์รูปภาพ เช่น https://.../image.jpg"
                    value={addingUrl}
                    onChange={(e) => setAddingUrl(e.target.value)}
                    onPressEnter={addPictureUrlManually}
                  />
                </Col>
                <Col>
                  <Button onClick={addPictureUrlManually}>เพิ่มลิงก์</Button>
                </Col>
              </Row>

              {/* Preview รูปจาก URL */}
              {pictureUrls.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <Image.PreviewGroup>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {pictureUrls.map((u) => (
                        <div
                          key={u}
                          style={{
                            position: "relative",
                            width: 120,
                            height: 90,
                            borderRadius: 8,
                            overflow: "hidden",
                            boxShadow: "0 1px 4px rgba(0,0,0,.12)",
                          }}
                        >
                          <Image src={u} alt="preview" width={120} height={90} style={{ objectFit: "cover" }} />
                          <Button
                            size="small"
                            danger
                            type="primary"
                            icon={<DeleteOutlined />}
                            onClick={() => {
                              setPictureUrls((prev) => prev.filter((x) => x !== u));
                              setFileList((prev) => prev.filter((x) => x.url !== u));
                            }}
                            style={{ position: "absolute", top: 4, right: 4 }}
                          />
                        </div>
                      ))}
                    </div>
                  </Image.PreviewGroup>
                </div>
              )}
            </Col>
          </Row>

          {/* ปุ่ม */}
          <Row justify="end">
            <Col style={{ marginTop: 32 }}>
              <Form.Item>
                <Space>
                  <Link to="/accommodation"><Button htmlType="button">ยกเลิก</Button></Link>
                  <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                    บันทึกการแก้ไข
                  </Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
}

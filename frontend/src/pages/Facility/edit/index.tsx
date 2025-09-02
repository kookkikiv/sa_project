import React, { useState, useEffect } from "react";
import {
  Space,
  Button,
  Col,
  Row,
  Divider,
  Form,
  Card,
  message,
  Select,
  Alert,
  Spin,
} from "antd";
import { SaveOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate, Link, useParams } from "react-router-dom";
import type { FacilityInterface } from "../../../interface/Facility";

// API Functions
const apiUrl = "http://localhost:8000";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  const tokenType = localStorage.getItem("token_type");
  return {
    "Content-Type": "application/json",
    ...(token && tokenType ? { Authorization: `${tokenType} ${token}` } : {}),
  };
};

const getFacilityById = async (id: string) => {
  try {
    const response = await fetch(`${apiUrl}/facility/${id}`, {
      headers: getAuthHeaders(),
    });
    const result = await response.json();
    return { status: response.status, data: result };
  } catch (error) {
    console.error("Get facility error:", error);
    return { status: 500, data: { error: "Network error" } };
  }
};

const updateFacility = async (id: string, data: any) => {
  try {
    const response = await fetch(`${apiUrl}/facility/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const result = await response.json();
    return { status: response.status, data: result };
  } catch (error) {
    console.error("Update facility error:", error);
    return { status: 500, data: { error: "Network error" } };
  }
};

const fetchAccommodations = async () => {
  try {
    const response = await fetch(`${apiUrl}/accommodation`, {
      headers: getAuthHeaders(),
    });
    if (response.ok) {
      const data = await response.json();
      return { status: response.status, data: data.data || data };
    }
    return { status: response.status, data: null };
  } catch (error) {
    console.error("Fetch accommodations error:", error);
    return { status: 500, data: null };
  }
};

const fetchRooms = async () => {
  try {
    const response = await fetch(`${apiUrl}/room`, {
      headers: getAuthHeaders(),
    });
    if (response.ok) {
      const data = await response.json();
      return { status: response.status, data: data.data || data };
    }
    return { status: response.status, data: null };
  } catch (error) {
    console.error("Fetch rooms error:", error);
    return { status: 500, data: null };
  }
};

const FacilityEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  // States for data
  const [accommodations, setAccommodations] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // ประเภทสิ่งอำนวยความสะดวก
  const FACILITY_TYPES = [
    { value: "accommodation", label: "สิ่งอำนวยความสะดวกในที่พัก" },
    { value: "room", label: "สิ่งอำนวยความสะดวกในห้องพัก" },
  ];

  // รายการสิ่งอำนวยความสะดวกแยกตามประเภท
  const FACILITY_OPTIONS = {
    accommodation: [
      { value: "swimming_pool", label: "สระว่ายน้ำ" },
      { value: "fitness_center", label: "ห้องออกกำลังกาย" },
      { value: "spa", label: "สปา" },
      { value: "restaurant", label: "ร้านอาหาร" },
      { value: "bar", label: "บาร์" },
      { value: "conference_room", label: "ห้องประชุม" },
      { value: "business_center", label: "ศูนย์ธุรกิจ" },
      { value: "parking", label: "ที่จอดรถ" },
      { value: "garden", label: "สวน" },
      { value: "playground", label: "สนามเด็กเล่น" },
      { value: "laundry", label: "บริการซักรีด" },
      { value: "concierge", label: "บริการคอนเซียร์จ" },
      { value: "24hr_reception", label: "แผนกต้อนรับ 24 ชั่วโมง" },
      { value: "wifi_lobby", label: "WiFi ในล็อบบี้" },
      { value: "elevator", label: "ลิฟต์" },
    ],
    room: [
      { value: "air_conditioning", label: "เครื่องปรับอากาศ" },
      { value: "bed", label: "เตียง" },
      { value: "pillow", label: "หมอน" },
      { value: "blanket", label: "ผ้าห่ม" },
      { value: "towel", label: "ผ้าเช็ดตัว" },
      { value: "hair_dryer", label: "ไดร์เป่าผม" },
      { value: "toothbrush_toothpaste", label: "แปรงสีฟันและยาสีฟัน" },
      { value: "shampoo", label: "แชมพู" },
      { value: "soap", label: "สบู่" },
      { value: "wifi", label: "WiFi" },
      { value: "tv", label: "โทรทัศน์" },
      { value: "minibar", label: "มินิบาร์" },
      { value: "safe", label: "ตู้เซฟ" },
      { value: "telephone", label: "โทรศัพท์" },
      { value: "desk", label: "โต๊ะทำงาน" },
      { value: "chair", label: "เก้าอี้" },
      { value: "wardrobe", label: "ตู้เสื้อผ้า" },
      { value: "mirror", label: "กระจกเงา" },
      { value: "slippers", label: "รองเท้าแตะ" },
      { value: "bathrobe", label: "เสื้อคลุมอาบน้ำ" },
      { value: "coffee_tea", label: "กาแฟและชา" },
      { value: "water_bottle", label: "น้ำดื่ม" },
      { value: "room_service", label: "บริการรูมเซอร์วิส" },
      { value: "balcony", label: "ระเบียง" },
    ],
  };

  const [selectedType, setSelectedType] = useState<string>("");
  const [facilityOptions, setFacilityOptions] = useState<Array<{value: string, label: string}>>([]);

  // ฟังก์ชันหาค่า value จากชื่อที่แสดง
  const findValueByLabel = (label: string, type: string) => {
    const options = FACILITY_OPTIONS[type as keyof typeof FACILITY_OPTIONS] || [];
    const found = options.find(option => option.label === label);
    return found ? found.value : label;
  };

  // โหลดข้อมูลที่พักและห้องพัก
  const loadData = async () => {
    setLoadingData(true);
    try {
      const [accRes, roomRes] = await Promise.all([
        fetchAccommodations(),
        fetchRooms()
      ]);

      // Set accommodations
      if (accRes.status === 200 && accRes.data) {
        const accList = Array.isArray(accRes.data) ? accRes.data : [];
        setAccommodations(accList);
      }

      // Set rooms
      if (roomRes.status === 200 && roomRes.data) {
        const roomList = Array.isArray(roomRes.data) ? roomRes.data : [];
        setRooms(roomList);
      }
    } catch (error) {
      console.error("Load data error:", error);
      messageApi.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoadingData(false);
    }
  };

  // อัพเดตตัวเลือกสิ่งอำนวยความสะดวกเมื่อเลือกประเภท
  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    setFacilityOptions(FACILITY_OPTIONS[value as keyof typeof FACILITY_OPTIONS] || []);
    // รีเซ็ตค่าเมื่อเปลี่ยนประเภท (ยกเว้นครั้งแรกที่โหลดข้อมูล)
    if (selectedType !== "") {
      form.setFieldsValue({ 
        Name: undefined, 
        AccommodationID: undefined,
        RoomID: undefined 
      });
    }
  };

  // โหลดข้อมูลสิ่งอำนวยความสะดวกตาม ID
  const loadFacilityData = async () => {
    if (!id) {
      messageApi.error("ไม่พบรหัสสิ่งอำนวยความสะดวก");
      navigate("/accommodation/facility");
      return;
    }

    try {
      setFetchLoading(true);
      const res = await getFacilityById(id);
      
      if (res.status === 200 && res.data) {
        const facilityData = res.data.data || res.data;
        
        // กำหนดประเภทและตัวเลือก
        const type = facilityData.Type;
        setSelectedType(type);
        setFacilityOptions(FACILITY_OPTIONS[type as keyof typeof FACILITY_OPTIONS] || []);
        
        // หาค่า value ที่ตรงกับชื่อที่แสดง
        const nameValue = findValueByLabel(facilityData.Name, type);
        
        // ตั้งค่าฟอร์ม
        form.setFieldsValue({
          Type: type,
          Name: nameValue,
          AccommodationID: facilityData.AccommodationID || undefined,
          RoomID: facilityData.RoomID || undefined,
        });
      } else {
        messageApi.error("ไม่พบข้อมูลสิ่งอำนวยความสะดวก");
        setTimeout(() => {
          navigate("/accommodation/facility");
        }, 2000);
      }
    } catch (error) {
      console.error("Load facility error:", error);
      messageApi.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      setTimeout(() => {
        navigate("/accommodation/facility");
      }, 2000);
    } finally {
      setFetchLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    if (!id) return;

    try {
      setLoading(true);

      // หาชื่อที่แสดงจากค่าที่เลือก
      const selectedOption = facilityOptions.find(option => option.value === values.Name);
      const displayName = selectedOption ? selectedOption.label : values.Name;

      const payload = {
        Name: displayName, // ใช้ชื่อที่แสดงแทน value
        Type: values.Type,
        AccommodationID: values.Type === "accommodation" ? values.AccommodationID : null,
        RoomID: values.Type === "room" ? values.RoomID : null,
      };

      // Validate required fields
      if (!payload.Name || !payload.Type) {
        messageApi.error("กรุณากรอกข้อมูลให้ครบถ้วน");
        return;
      }

      // Validate based on type
      if (payload.Type === "accommodation" && !payload.AccommodationID) {
        messageApi.error("กรุณาเลือกที่พัก");
        return;
      }

      if (payload.Type === "room" && !payload.RoomID) {
        messageApi.error("กรุณาเลือกห้องพัก");
        return;
      }

      const res = await updateFacility(id, payload);
      
      if (res.status === 200) {
        messageApi.success(res.data?.message || "แก้ไขข้อมูลสิ่งอำนวยความสะดวกสำเร็จ");
        setTimeout(() => {
          navigate("/accommodation/facility");
        }, 1500);
      } else {
        messageApi.error(res.data?.error || "แก้ไขข้อมูลไม่สำเร็จ");
      }
    } catch (error) {
      console.error("Error updating facility:", error);
      messageApi.error("เกิดข้อผิดพลาดในการแก้ไขข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([loadData(), loadFacilityData()]);
  }, [id]);

  if (fetchLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p style={{ marginTop: '16px' }}>กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  return (
    <div>
      {contextHolder}
      
      {/* Header */}
      <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Link to="/accommodation/facility">
            <Button 
              icon={<ArrowLeftOutlined />}
              size="large"
            >
              กลับ
            </Button>
          </Link>
        </Col>
        <Col flex="auto">
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>
            แก้ไขข้อมูลสิ่งอำนวยความสะดวก
          </h2>
        </Col>
      </Row>

      {/* Information Alert */}
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
        message="คำอธิบาย"
        description={
          <div>
            <p><strong>สิ่งอำนวยความสะดวกในที่พัก:</strong> เช่น สระว่ายน้ำ ห้องออกกำลังกาย ร้านอาหาร ที่จอดรถ (ต้องเลือกที่พัก)</p>
            <p><strong>สิ่งอำนวยความสะดวกในห้องพัก:</strong> เช่น เครื่องปรับอากาศ เตียง ไดร์เป่าผม แปรงสีฟันและยาสีฟัน (ต้องเลือกห้องพัก)</p>
          </div>
        }
      />

      {/* Warning if no data */}
      {(accommodations.length === 0 && selectedType === "accommodation") && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message="ยังไม่มีข้อมูลที่พัก"
          description="กรุณาไปที่เมนู 'ที่พัก' เพื่อสร้างที่พักก่อน"
        />
      )}

      {(rooms.length === 0 && selectedType === "room") && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message="ยังไม่มีข้อมูลห้องพัก"
          description="กรุณาไปที่เมนู 'ห้อง' เพื่อสร้างห้องพักก่อน"
        />
      )}

      {/* Form Card */}
      <Card 
        style={{ 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderRadius: '8px'
        }}
      >
        <Spin spinning={loading}>
          <Form
            form={form}
            name="facility-edit"
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
            requiredMark="optional"
          >
            <Row gutter={[24, 16]}>
              {/* Facility Information Section */}
              <Col span={24}>
                <Divider orientation="left" style={{ fontSize: '16px', fontWeight: 500 }}>
                  ข้อมูลสิ่งอำนวยความสะดวก
                </Divider>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="ประเภทสิ่งอำนวยความสะดวก"
                  name="Type"
                  rules={[
                    { required: true, message: "กรุณาเลือกประเภทสิ่งอำนวยความสะดวก" },
                  ]}
                >
                  <Select 
                    placeholder="เลือกประเภทสิ่งอำนวยความสะดวก" 
                    size="large"
                    onChange={handleTypeChange}
                    options={FACILITY_TYPES}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="ชื่อสิ่งอำนวยความสะดวก"
                  name="Name"
                  rules={[
                    { required: true, message: "กรุณาเลือกชื่อสิ่งอำนวยความสะดวก" },
                  ]}
                >
                  <Select 
                    placeholder={selectedType ? "เลือกสิ่งอำนวยความสะดวก" : "กรุณาเลือกประเภทก่อน"}
                    size="large"
                    disabled={!selectedType}
                    showSearch
                    optionFilterProp="label"
                    options={facilityOptions}
                  />
                </Form.Item>
              </Col>

              {/* เลือกที่พัก - แสดงเมื่อเลือกประเภท accommodation */}
              {selectedType === "accommodation" && (
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    label="เลือกที่พัก"
                    name="AccommodationID"
                    rules={[
                      { required: true, message: "กรุณาเลือกที่พัก" },
                    ]}
                  >
                    <Select 
                      placeholder="เลือกที่พัก"
                      size="large"
                      showSearch
                      optionFilterProp="label"
                      loading={loadingData}
                      options={accommodations.map(acc => ({
                        value: acc.ID,
                        label: acc.Name || `ที่พัก #${acc.ID}`,
                      }))}
                    />
                  </Form.Item>
                </Col>
              )}

              {/* เลือกห้องพัก - แสดงเมื่อเลือกประเภท room */}
              {selectedType === "room" && (
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    label="เลือกห้องพัก"
                    name="RoomID"
                    rules={[
                      { required: true, message: "กรุณาเลือกห้องพัก" },
                    ]}
                  >
                    <Select 
                      placeholder="เลือกห้องพัก"
                      size="large"
                      showSearch
                      optionFilterProp="label"
                      loading={loadingData}
                      options={rooms.map(room => ({
                        value: room.ID,
                        label: room.Name || `ห้อง #${room.ID}`,
                      }))}
                    />
                  </Form.Item>
                </Col>
              )}
            </Row>

            {/* Action Buttons */}
            <Row justify="end" style={{ marginTop: 32 }}>
              <Col>
                <Space size="middle">
                  <Link to="/accommodation/facility">
                    <Button 
                      size="large"
                      disabled={loading}
                    >
                      ยกเลิก
                    </Button>
                  </Link>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    size="large"
                    loading={loading}
                  >
                    {loading ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
                  </Button>
                </Space>
              </Col>
            </Row>
          </Form>
        </Spin>
      </Card>
    </div>
  );
};

export default FacilityEdit;
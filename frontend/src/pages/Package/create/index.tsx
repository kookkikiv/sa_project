import {
  Space,
  Button,
  Col,
  Row,
  Divider,
  Form,
  Input,
  Card,
  message,
  Select,
  DatePicker,
  InputNumber,
} from "antd";
import { useState, useEffect } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { type PackageInterface } from "../../../interface/Package";
import { type ProvinceInterface } from "../../../interface/Province";
import { type DistrictInterface } from "../../../interface/District";
import { type SubdistrictInterface } from "../../../interface/Subdistrict";
import { type GuideInterface } from "../../../interface/Guide";
import {
  GetProvince,
  GetDistrict,
  GetSubdistrict,
  GetGuide,
  CreatePackage,
} from "../../../services/https";
import { useNavigate, Link } from "react-router-dom";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

function PackageCreate() {
  const navigate = useNavigate();
  const [form] = Form.useForm<PackageInterface>();
  const [messageApi, contextHolder] = message.useMessage();

  // States for dropdown data
  const [province, setProvince] = useState<ProvinceInterface[]>([]);
  const [district, setDistrict] = useState<DistrictInterface[]>([]);
  const [subdistrict, setSubdistrict] = useState<SubdistrictInterface[]>([]);
  const [guide, setGuide] = useState<GuideInterface[]>([]);

  // Loading states
  const [loadingProvince, setLoadingProvince] = useState(false);
  const [loadingDistrict, setLoadingDistrict] = useState(false);
  const [loadingSubdistrict, setLoadingSubdistrict] = useState(false);
  const [loadingGuide, setLoadingGuide] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Selected values for cascading
  const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);

  // Helper function: safely extract array from API response
  const asArray = <T,>(val: any): T[] => {
    if (Array.isArray(val)) return val as T[];
    if (Array.isArray(val?.data)) return val.data as T[];
    if (Array.isArray(val?.items)) return val.items as T[];
    return [];
  };

  // โหลดข้อมูลจังหวัด
  const onGetProvince = async () => {
    try {
      setLoadingProvince(true);
      const res = await GetProvince();
      
      if (res.status === 200) {
        const provinceData = asArray<ProvinceInterface>(res.data);
        setProvince(provinceData);
        
        if (provinceData.length === 0) {
          messageApi.warning("ไม่พบข้อมูลจังหวัด");
        }
      } else {
        setProvince([]);
        messageApi.error(res?.data?.error || "ไม่สามารถโหลดข้อมูลจังหวัดได้");
      }
    } catch (error) {
      console.error("Error loading provinces:", error);
      setProvince([]);
      messageApi.error("เกิดข้อผิดพลาดในการโหลดจังหวัด");
    } finally {
      setLoadingProvince(false);
    }
  };

  // โหลดข้อมูลอำเภอตามจังหวัดที่เลือก
  const onGetDistrict = async (provinceId: number) => {
    if (!provinceId) return;
    
    try {
      setLoadingDistrict(true);
      setDistrict([]);
      
      const res = await GetDistrict(provinceId);
      
      if (res.status === 200) {
        const districtData = asArray<DistrictInterface>(res.data);
        setDistrict(districtData);
        
        if (districtData.length === 0) {
          messageApi.warning("ไม่พบข้อมูลอำเภอในจังหวัดนี้");
        }
      } else {
        setDistrict([]);
        messageApi.error(res?.data?.error || "ไม่สามารถโหลดข้อมูลอำเภอได้");
      }
    } catch (error) {
      console.error("Error loading districts:", error);
      setDistrict([]);
      messageApi.error("เกิดข้อผิดพลาดในการโหลดอำเภอ");
    } finally {
      setLoadingDistrict(false);
    }
  };

  // โหลดข้อมูลตำบลตามอำเภอที่เลือก
  const onGetSubdistrict = async (districtId: number) => {
    if (!districtId) return;
    
    try {
      setLoadingSubdistrict(true);
      setSubdistrict([]);
      
      const res = await GetSubdistrict(districtId);
      
      if (res.status === 200) {
        const subdistrictData = asArray<SubdistrictInterface>(res.data);
        setSubdistrict(subdistrictData);
        
        if (subdistrictData.length === 0) {
          messageApi.warning("ไม่พบข้อมูลตำบลในอำเภอนี้");
        }
      } else {
        setSubdistrict([]);
        messageApi.error(res?.data?.error || "ไม่สามารถโหลดข้อมูลตำบลได้");
      }
    } catch (error) {
      console.error("Error loading subdistricts:", error);
      setSubdistrict([]);
      messageApi.error("เกิดข้อผิดพลาดในการโหลดตำบล");
    } finally {
      setLoadingSubdistrict(false);
    }
  };

  // โหลดข้อมูลไกด์
  const onGetGuide = async () => {
    try {
      setLoadingGuide(true);
      const res = await GetGuide();
      
      if (res.status === 200) {
        const guideData = asArray<GuideInterface>(res.data);
        setGuide(guideData);
        
        if (guideData.length === 0) {
          messageApi.warning("ไม่พบข้อมูลไกด์");
        }
      } else {
        setGuide([]);
        messageApi.error(res?.data?.error || "ไม่สามารถโหลดข้อมูลไกด์ได้");
      }
    } catch (error) {
      console.error("Error loading guides:", error);
      setGuide([]);
      messageApi.error("เกิดข้อผิดพลาดในการโหลดไกด์");
    } finally {
      setLoadingGuide(false);
    }
  };

  // Handle form submission
  const onFinish = async (values: any) => {
    try {
      setSubmitting(true);
      
      const adminId = localStorage.getItem("id");
      if (!adminId) {
        messageApi.error("ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่");
        return;
      }

      // จัดการวันที่
      let startDate, finalDate;
      if (values.dateRange && values.dateRange[0] && values.dateRange[1]) {
        startDate = dayjs(values.dateRange[0]).format('YYYY-MM-DD');
        finalDate = dayjs(values.dateRange[1]).format('YYYY-MM-DD');
      }

      const payload = {
        Name: values.Name?.trim(),
        People: values.People,
        StartDate: startDate,
        FinalDate: finalDate,
        Price: values.Price,
        ProvinceID: values.ProvinceID,
        DistrictID: values.DistrictID,
        SubdistrictID: values.SubdistrictID,
        GuideID: values.GuideID,
        AdminID: parseInt(adminId, 10),
      };

      // Validate required fields
      if (!payload.Name) {
        messageApi.error("กรุณากรอกชื่อแพ็คเกจ");
        return;
      }

      if (!payload.GuideID) {
        messageApi.error("กรุณาเลือกไกด์");
        return;
      }

      const res = await CreatePackage(payload);
      
      if (res.status === 201 || res.status === 200) {
        messageApi.success(res?.data?.message || "เพิ่มข้อมูลแพ็คเกจสำเร็จ");
        form.resetFields();
        setTimeout(() => navigate("/package"), 1000);
      } else {
        messageApi.error(res?.data?.error || "ไม่สามารถบันทึกข้อมูลได้");
      }
    } catch (error) {
      console.error("Error creating package:", error);
      messageApi.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle province change
  const handleProvinceChange = (value: number | undefined) => {
    setSelectedProvince(value || null);
    setSelectedDistrict(null);
    setDistrict([]);
    setSubdistrict([]);
    
    // Reset form fields
    form.setFieldsValue({ 
      DistrictID: undefined, 
      SubdistrictID: undefined 
    });
    
    if (value) {
      onGetDistrict(value);
    }
  };

  // Handle district change
  const handleDistrictChange = (value: number | undefined) => {
    setSelectedDistrict(value || null);
    setSubdistrict([]);
    
    // Reset subdistrict field
    form.setFieldsValue({ SubdistrictID: undefined });
    
    if (value) {
      onGetSubdistrict(value);
    }
  };

  // Load initial data on component mount
  useEffect(() => {
    onGetProvince();
    onGetGuide();
  }, []);

  return (
    <div>
      {contextHolder}
      <Card>
        <h2>เพิ่มข้อมูลแพ็คเกจทัวร์</h2>
        <Divider />
        
        <Form
          form={form}
          name="package-create"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Row gutter={[16, 16]}>
            {/* ชื่อแพ็คเกจ */}
            <Col xs={24} sm={24} md={12} lg={12}>
              <Form.Item
                label="ชื่อแพ็คเกจ"
                name="Name"
                rules={[
                  { required: true, message: "กรุณากรอกชื่อแพ็คเกจ" },
                  { min: 2, message: "ชื่อแพ็คเกจต้องมีความยาวอย่างน้อย 2 ตัวอักษร" },
                  { max: 200, message: "ชื่อแพ็คเกจต้องมีความยาวไม่เกิน 200 ตัวอักษร" }
                ]}
              >
                <Input 
                  placeholder="กรอกชื่อแพ็คเกจทัวร์" 
                  disabled={submitting}
                />
              </Form.Item>
            </Col>

            {/* จำนวนคน */}
            <Col xs={24} sm={24} md={12} lg={12}>
              <Form.Item
                label="จำนวนคน"
                name="People"
                rules={[
                  { required: true, message: "กรุณากรอกจำนวนคน" },
                  { type: 'number', min: 1, message: "จำนวนคนต้องมากกว่า 0" }
                ]}
              >
                <InputNumber
                  placeholder="กรอกจำนวนคน"
                  disabled={submitting}
                  style={{ width: '100%' }}
                  min={1}
                  max={100}
                />
              </Form.Item>
            </Col>

            {/* ช่วงวันที่ */}
            <Col xs={24} sm={24} md={12} lg={12}>
              <Form.Item
                label="ช่วงวันที่"
                name="dateRange"
                rules={[{ required: true, message: "กรุณาเลือกช่วงวันที่" }]}
              >
                <RangePicker
                  placeholder={["วันเริ่มต้น", "วันสิ้นสุด"]}
                  disabled={submitting}
                  style={{ width: '100%' }}
                  disabledDate={(current) => current && current < dayjs().startOf('day')}
                />
              </Form.Item>
            </Col>

            {/* ราคา */}
            <Col xs={24} sm={24} md={12} lg={12}>
              <Form.Item
                label="ราคา (บาท)"
                name="Price"
                rules={[
                  { required: true, message: "กรุณากรอกราคา" },
                  { type: 'number', min: 1, message: "ราคาต้องมากกว่า 0" }
                ]}
              >
                <InputNumber
                  placeholder="กรอกราคา"
                  disabled={submitting}
                  style={{ width: '100%' }}
                  min={1}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>

            {/* ไกด์ */}
            <Col xs={24} sm={24} md={12} lg={12}>
              <Form.Item
                label="ไกด์"
                name="GuideID"
                rules={[{ required: true, message: "กรุณาเลือกไกด์" }]}
              >
                <Select
                  placeholder="เลือกไกด์"
                  allowClear
                  loading={loadingGuide}
                  disabled={submitting}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={guide.map((item) => ({
                    label: `${item.Name} `,
                    value: item.ID,
                  }))}
                />
              </Form.Item>
            </Col>

            {/* จังหวัด */}
            <Col xs={24} sm={24} md={12} lg={12}>
              <Form.Item
                label="จังหวัด"
                name="ProvinceID"
                rules={[{ required: true, message: "กรุณาเลือกจังหวัด" }]}
              >
                <Select
                  placeholder="เลือกจังหวัด"
                  allowClear
                  loading={loadingProvince}
                  disabled={submitting}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={province.map((item) => ({
                    label: item.NameTh,
                    value: item.ID,
                  }))}
                  onChange={handleProvinceChange}
                />
              </Form.Item>
            </Col>

            {/* อำเภอ */}
            <Col xs={24} sm={24} md={12} lg={12}>
              <Form.Item
                label="อำเภอ"
                name="DistrictID"
                rules={[{ required: true, message: "กรุณาเลือกอำเภอ" }]}
              >
                <Select
                  placeholder="เลือกอำเภอ"
                  allowClear
                  disabled={!selectedProvince || submitting}
                  loading={loadingDistrict}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={district.map((item) => ({
                    label: item.NameTh,
                    value: item.ID,
                  }))}
                  onChange={handleDistrictChange}
                  notFoundContent={!selectedProvince ? "กรุณาเลือกจังหวัดก่อน" : "ไม่พบข้อมูล"}
                />
              </Form.Item>
            </Col>

            {/* ตำบล */}
            <Col xs={24} sm={24} md={12} lg={12}>
              <Form.Item
                label="ตำบล"
                name="SubdistrictID"
                rules={[{ required: true, message: "กรุณาเลือกตำบล" }]}
              >
                <Select
                  placeholder="เลือกตำบล"
                  allowClear
                  disabled={!selectedDistrict || submitting}
                  loading={loadingSubdistrict}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={subdistrict.map((item) => ({
                    label: item.NameTh,
                    value: item.ID,
                  }))}
                  notFoundContent={!selectedDistrict ? "กรุณาเลือกอำเภอก่อน" : "ไม่พบข้อมูล"}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Action Buttons */}
          <Row justify="end">
            <Col style={{ marginTop: 24 }}>
              <Form.Item>
                <Space>
                  <Link to="/package">
                    <Button disabled={submitting}>
                      ยกเลิก
                    </Button>
                  </Link>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    icon={<PlusOutlined />}
                    loading={submitting}
                  >
                    {submitting ? "กำลังบันทึก..." : "บันทึก"}
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

export default PackageCreate;
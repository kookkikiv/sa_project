// src/pages/Accommodation/index.tsx
import { useState, useEffect } from "react";
import {
  Space,
  Table,
  Button,
  Col,
  Row,
  Divider,
  message,
  Popconfirm,
} from "antd";
import { PlusOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import {
  GetAccommodation,
  DeleteAccommodationById,
  GetProvince,
  GetDistrict,
  GetSubdistrict,
} from "../../services/https";
import { type AccommodationInterface } from "../../interface/Accommodation";
import { Link, useNavigate } from "react-router-dom";

// ---------- helpers ----------
type RowWithNames = AccommodationInterface & {
  provinceName?: string;
  districtName?: string;
  subdistrictName?: string;
};

// ดึง array จาก response ที่อาจห่อ data/items มา
const asArray = <T,>(val: any): T[] =>
  Array.isArray(val) ? (val as T[])
  : Array.isArray(val?.data) ? (val.data as T[])
  : Array.isArray(val?.items) ? (val.items as T[])
  : [];

// แปลงเป็น number (ถ้าเป็น "", null, undefined -> undefined)
const toNum = (v: any) =>
  v === null || v === undefined || v === "" || Number.isNaN(Number(v)) ? undefined : Number(v);

// หาค่าตัวแรกที่ไม่ว่าง
const pick = (...vals: any[]) => vals.find(v => v !== undefined && v !== null && v !== "");

// อ่าน ID ได้ทุกแบบ (camel/snake/nested)
const getProvinceId = (r: any) =>
  toNum(pick(r.ProvinceID, r.provinceID, r.province_id, r.ProvinceId, r.provinceId, r.Province?.ID));
const getDistrictId = (r: any) =>
  toNum(pick(r.DistrictID, r.districtID, r.district_id, r.DistrictId, r.districtId, r.District?.ID));
const getSubdistrictId = (r: any) =>
  toNum(pick(r.SubdistrictID, r.subdistrictID, r.subdistrict_id, r.SubdistrictId, r.subdistrictId, r.Subdistrict?.ID));

// อ่าน code (บางทีฝั่งข้อมูลใช้ code ไม่ใช่ ID)
const getProvinceCode = (r: any) =>
  String(pick(r.ProvinceCode, r.provinceCode, r.province_code, r.Province?.provinceCode) ?? "");
const getDistrictCode = (r: any) =>
  String(pick(r.DistrictCode, r.districtCode, r.district_code, r.District?.districtCode) ?? "");
const getSubdistrictCode = (r: any) =>
  String(pick(r.SubdistrictCode, r.subdistrictCode, r.subdistrict_code, r.Subdistrict?.subdistrictCode) ?? "");

// label fallback หลายคีย์
const getProvinceLabel = (p: any) =>
  p?.provinceNameTh || p?.provinceNameTH || p?.province_name_th ||
  p?.provinceNameEn || p?.provinceNameEN || p?.province_name_en ||
  p?.NameTh || p?.NameEn || p?.name_th || p?.name || "";

const getDistrictLabel = (d: any) =>
  d?.districtNameTh || d?.district_name_th ||
  d?.districtNameEn || d?.district_name_en ||
  d?.NameTh || d?.NameEn || d?.name_th || d?.name || "";

const getSubdistrictLabel = (s: any) =>
  s?.subdistrictNameTh || s?.subdistrict_name_th ||
  s?.subdistrictNameEn || s?.subdistrict_name_en ||
  s?.NameTh || s?.NameEn || s?.name_th || s?.name || "";

function Accommodation() {
  const navigate = useNavigate();
  const [acc, setAcc] = useState<RowWithNames[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [messageApi, contextHolder] = message.useMessage();

  const myId = localStorage.getItem("id") ?? "";

  const deleteAccommodationById = async (id: string | number) => {
    try {
      const res = await DeleteAccommodationById(String(id));
      if (res.status === 200) {
        messageApi.success(res.data?.message ?? "ลบข้อมูลสำเร็จ");
        await getAcc();
      } else {
        messageApi.error(res.data?.error ?? "ลบข้อมูลไม่สำเร็จ");
      }
    } catch {
      messageApi.error("เกิดข้อผิดพลาดในการลบข้อมูล");
    }
  };

  // โหลด + เติมชื่อจังหวัด/อำเภอ/ตำบล
  const getAcc = async () => {
    try {
      setLoading(true);
      const res = await GetAccommodation();
      if (res.status !== 200) throw new Error(res.data?.error ?? "ไม่สามารถดึงข้อมูลที่พักได้");
      const raw = asArray<AccommodationInterface>(res.data);

      // 1) provinces -> map ได้ทั้งตาม ID และตาม code
      const provRes = await GetProvince();
      const provinces = asArray<any>(provRes?.data);
      const provinceById: Record<string, string> = {};
      const provinceByCode: Record<string, string> = {};
      provinces.forEach((p: any) => {
        const label = getProvinceLabel(p);
        if (p?.ID !== undefined) provinceById[String(p.ID)] = label;
        const code = p?.provinceCode || p?.ProvinceCode || p?.code;
        if (code) provinceByCode[String(code)] = label;
      });

      // 2) districts -> สร้าง map ตาม ID และตาม code (ดึงเฉพาะจังหวัดที่พบใน raw)
      const uniqProvinceIds = Array.from(new Set(raw.map((r: any) => getProvinceId(r)).filter(Boolean))) as number[];
      const districtById: Record<string, string> = {};
      const districtByCode: Record<string, string> = {};
      await Promise.all(
        uniqProvinceIds.map(async (pid) => {
          try {
            const dRes = await GetDistrict(pid);
            const districts = asArray<any>(dRes?.data);
            districts.forEach((d: any) => {
              const label = getDistrictLabel(d);
              if (d?.ID !== undefined) districtById[String(d.ID)] = label;
              const code = d?.districtCode || d?.DistrictCode || d?.code;
              if (code) districtByCode[String(code)] = label;
            });
          } catch {}
        })
      );

      // 3) subdistricts -> map ตาม ID และตาม code (ดึงเฉพาะอำเภอที่พบใน raw)
      const uniqDistrictIds = Array.from(new Set(raw.map((r: any) => getDistrictId(r)).filter(Boolean))) as number[];
      const subdistrictById: Record<string, string> = {};
      const subdistrictByCode: Record<string, string> = {};
      await Promise.all(
        uniqDistrictIds.map(async (did) => {
          try {
            const sRes = await GetSubdistrict(did);
            const subs = asArray<any>(sRes?.data);
            subs.forEach((s: any) => {
              const label = getSubdistrictLabel(s);
              if (s?.ID !== undefined) subdistrictById[String(s.ID)] = label;
              const code = s?.subdistrictCode || s?.SubdistrictCode || s?.code;
              if (code) subdistrictByCode[String(code)] = label;
            });
          } catch {}
        })
      );

      // 4) รวมชื่อเข้ากับแถว (มี fallback หลายชั้น)
      const enriched: RowWithNames[] = raw.map((r: any) => {
        const pid = getProvinceId(r);
        const did = getDistrictId(r);
        const sid = getSubdistrictId(r);

        const pCode = getProvinceCode(r);
        const dCode = getDistrictCode(r);
        const sCode = getSubdistrictCode(r);

        const provinceName =
          (r.Province && getProvinceLabel(r.Province)) ||
          provinceById[String(pid ?? "")] ||
          provinceByCode[String(pCode)] ||
          r.provinceNameTh || r.provinceNameTH || r.province_name_th || "";

        const districtName =
          (r.District && getDistrictLabel(r.District)) ||
          districtById[String(did ?? "")] ||
          districtByCode[String(dCode)] ||
          r.districtNameTh || r.district_name_th || "";

        const subdistrictName =
          (r.Subdistrict && getSubdistrictLabel(r.Subdistrict)) ||
          subdistrictById[String(sid ?? "")] ||
          subdistrictByCode[String(sCode)] ||
          r.subdistrictNameTh || r.subdistrict_name_th || "";

        return { ...r, provinceName, districtName, subdistrictName };
      });

      setAcc(enriched);
    } catch (e: any) {
      setAcc([]);
      messageApi.error(e?.message || "เกิดข้อผิดพลาดในการดึงข้อมูลที่พัก");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void getAcc();
  }, []);

  const columns: ColumnsType<RowWithNames> = [
    {
      title: "",
      width: 72,
      render: (record) => {
        const isMe = String(record?.ID ?? "") === myId;
        if (isMe) return null;
        return (
          <Popconfirm
            title="ยืนยันการลบ?"
            description="คุณต้องการลบรายการนี้หรือไม่"
            okText="ลบ"
            cancelText="ยกเลิก"
            onConfirm={() => deleteAccommodationById(record.ID as any)}
          >
            <Button type="dashed" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        );
      },
    },
    { title: "ลำดับ", dataIndex: "ID", key: "ID", width: 100 },
    { title: "ชื่อที่พัก", dataIndex: "Name", key: "Name" },
    { title: "จังหวัด", dataIndex: "provinceName", key: "provinceName", width: 160 },
    { title: "อำเภอ", dataIndex: "districtName", key: "districtName", width: 160 },
    { title: "ตำบล", dataIndex: "subdistrictName", key: "subdistrictName", width: 160 },
    { title: "ประเภท", dataIndex: "Type", key: "Type", width: 140 },
    { title: "สถานะ", dataIndex: "Status", key: "Status", width: 120 },
    {
      title: "",
      width: 140,
      render: (record) => (
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => navigate(`/accommodation/edit/${record.ID}`)}
        >
          แก้ไขข้อมูล
        </Button>
      ),
    },
  ];

  return (
    <>
      {contextHolder}

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <h2 style={{ margin: 0 }}>จัดการข้อมูลที่พัก</h2>
        </Col>
        <Col span={12} style={{ textAlign: "end", alignSelf: "center" }}>
          <Space>
            <Link to="/accommodation/create">
              <Button type="primary" icon={<PlusOutlined />}>
                สร้างข้อมูล
              </Button>
            </Link>
          </Space>
        </Col>
      </Row>

      <Divider style={{ margin: "12px 0 16px" }} />

      <div style={{ marginTop: 12 }}>
        <Table<RowWithNames>
          rowKey={(r) => String((r as any).ID ?? "")}
          loading={loading}
          columns={columns}
          dataSource={Array.isArray(acc) ? acc : []}
          style={{ width: "100%", overflow: "auto" }}
          pagination={{ pageSize: 10, showSizeChanger: false }}
        />
      </div>
    </>
  );
}

export default Accommodation;

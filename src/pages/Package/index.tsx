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
  Tag,
} from "antd";
import { PlusOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import {
  GetPackage,
  DeletePackageById,
} from "../../services/https/index";
import { type PackageInterface } from "../../interface/Package";
import { Link, useNavigate } from "react-router-dom";

function Package() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState<PackageInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [messageApi, contextHolder] = message.useMessage();

  const myId = localStorage.getItem("id") ?? "";

  const deletePackageById = async (id: string | number) => {
    try {
      const res = await DeletePackageById(String(id));
      if (res.status === 200) {
        messageApi.success(res.data?.message ?? "ลบข้อมูลสำเร็จ");
        await getPackages();
      } else {
        messageApi.error(res.data?.error ?? "ลบข้อมูลไม่สำเร็จ");
      }
    } catch (e) {
      messageApi.error("เกิดข้อผิดพลาดในการลบข้อมูล");
    }
  };

  const getPackages = async () => {
    try {
      setLoading(true);
      const res = await GetPackage();
      if (res.status === 200) {
        const list =
          Array.isArray(res.data)
            ? res.data
            : Array.isArray(res.data?.data)
            ? res.data.data
            : Array.isArray(res.data?.items)
            ? res.data.items
            : [];

        setPackages(list as PackageInterface[]);
      } else {
        setPackages([]);
        messageApi.error(res.data?.error ?? "ไม่สามารถดึงข้อมูลแพ็คเกจได้");
      }
    } catch (e) {
      setPackages([]);
      messageApi.error("เกิดข้อผิดพลาดในการดึงข้อมูลแพ็คเกจ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void getPackages();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('th-TH');
  };

  const formatPrice = (price: string | number) => {
    if (!price) return "-";
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
    }).format(Number(price));
  };

  const columns: ColumnsType<PackageInterface> = [
    {
      title: "",
      width: 72,
      render: (record) => {
        const isMyPackage = String(record?.AdminID ?? "") === myId;
        // Only show delete button if current user is the creator
        if (!isMyPackage) return null;
        return (
          <Popconfirm
            title="ยืนยันการลบ?"
            description="คุณต้องการลบรายการนี้หรือไม่"
            okText="ลบ"
            cancelText="ยกเลิก"
            onConfirm={() => deletePackageById(record.ID as any)}
          >
            <Button type="dashed" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        );
      },
    },
    {
      title: "ลำดับ",
      dataIndex: "ID",
      key: "ID",
      width: 80,
    },
    {
      title: "ชื่อแพ็คเกจ",
      dataIndex: "Name",
      key: "Name",
      width: 200,
    },
    {
      title: "จำนวนคน",
      dataIndex: "People",
      key: "People",
      width: 100,
      render: (value) => value ? `${value} คน` : "-",
    },
    {
      title: "วันเริ่มต้น",
      dataIndex: "StartDate",
      key: "StartDate",
      width: 120,
      render: formatDate,
    },
    {
      title: "วันสิ้นสุด",
      dataIndex: "FinalDate",
      key: "FinalDate",
      width: 120,
      render: formatDate,
    },
    {
      title: "ราคา",
      dataIndex: "Price",
      key: "Price",
      width: 120,
      render: formatPrice,
    },
    {
      title: "สถานะ",
      key: "status",
      width: 100,
      render: (record) => {
        const today = new Date();
        const startDate = new Date(record.StartDate);
        const endDate = new Date(record.FinalDate);
        
        if (today < startDate) {
          return <Tag color="blue">เตรียมเดินทาง</Tag>;
        } else if (today >= startDate && today <= endDate) {
          return <Tag color="green">กำลังดำเนินการ</Tag>;
        } else {
          return <Tag color="gray">สิ้นสุดแล้ว</Tag>;
        }
      },
    },
    {
      title: "",
      width: 140,
      render: (record) => (
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => navigate(`/package/edit/${record.ID}`)}
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
          <h2 style={{ margin: 0 }}>จัดการข้อมูลแพ็คเกจทัวร์</h2>
        </Col>
        <Col span={12} style={{ textAlign: "end", alignSelf: "center" }}>
          <Space>
            <Link to="/package/create">
              <Button type="primary" icon={<PlusOutlined />}>
                สร้างข้อมูล
              </Button>
            </Link>
          </Space>
        </Col>
      </Row>

      <Divider style={{ margin: "12px 0 16px" }} />

      <div style={{ marginTop: 12 }}>
        <Table<PackageInterface>
          rowKey={(r) => String((r as any).ID ?? "")}
          loading={loading}
          columns={columns}
          dataSource={Array.isArray(packages) ? packages : []}
          style={{ width: "100%", overflow: "auto" }}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          scroll={{ x: 1000 }}
        />
      </div>
    </>
  );
}

export default Package;
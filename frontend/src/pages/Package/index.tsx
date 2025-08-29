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
  GetPackage,
  DeletePackageById,
} from "../../services/https/index";
import { type PackageInterface } from "../../interface/Package";
import { Link, useNavigate } from "react-router-dom";

function Package() {
  const navigate = useNavigate();
  const [acc, setAcc] = useState<PackageInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [messageApi, contextHolder] = message.useMessage();

  // เก็บ id ของตัวเอง (string) ไว้เทียบกับ record.ID (แปลงเป็น string ตอนเทียบ)
  const myId = localStorage.getItem("id") ?? "";

  const deletePackageById = async (id: string | number) => {
    try {
      const res = await DeletePackageById(String(id));
      if (res.status === 200) {
        messageApi.success(res.data?.message ?? "ลบข้อมูลสำเร็จ");
        await getAcc();
      } else {
        messageApi.error(res.data?.error ?? "ลบข้อมูลไม่สำเร็จ");
      }
    } catch (e) {
      messageApi.error("เกิดข้อผิดพลาดในการลบข้อมูล");
    }
  };

  const getAcc = async () => {
    try {
      setLoading(true);
      const res = await GetPackage();
      if (res.status === 200) {
        // รองรับหลายรูปแบบผลลัพธ์จาก backend
        const list =
          Array.isArray(res.data)
            ? res.data
            : Array.isArray(res.data?.data)
            ? res.data.data
            : Array.isArray(res.data?.items)
            ? res.data.items
            : [];

        setAcc(list as PackageInterface[]);
      } else {
        setAcc([]);
        messageApi.error(res.data?.error ?? "ไม่สามารถดึงข้อมูลแพ็คเกจได้");
      }
    } catch (e) {
      setAcc([]);
      messageApi.error("เกิดข้อผิดพลาดในการดึงข้อมูลแพ็คเกจ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void getAcc();
  }, []);

  const columns: ColumnsType<PackageInterface> = [
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
      width: 100,
    },
    {
      title: "ชื่อแพ็คเกจ",
      dataIndex: "Name",
      key: "Name",
    },
    {
      title: "ประเภท",
      dataIndex: "Type",
      key: "Type",
      width: 160,
    },
    {
      title: "สถานะ",
      dataIndex: "Status",
      key: "Status",
      width: 140,
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
          <h2 style={{ margin: 0 }}>จัดการข้อมูลแพ็คเกจ</h2>
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
          dataSource={Array.isArray(acc) ? acc : []}
          style={{ width: "100%", overflow: "auto" }}
          pagination={{ pageSize: 10, showSizeChanger: false }}
        />
      </div>
    </>
  );
}

export default Package;

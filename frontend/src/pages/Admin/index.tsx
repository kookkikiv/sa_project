import { useState, useEffect } from "react";
import { Space, Table, Button, Col, Row, Divider, message } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { GetAdmin, DeleteAdminById } from "../../services/https/index";
import { type AdminInterface } from "../../interface/IAdmin";
import { Link, useNavigate } from "react-router-dom";

function Admin() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminInterface[]>([]);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const myId = localStorage.getItem("id");

  const columns: ColumnsType<AdminInterface> = [
    {
      title: "",
      render: (record) => (
        <>
          {myId == record?.ID ? (
            <></>
          ) : (
            <Button
              type="dashed"
              danger
              icon={<DeleteOutlined />}
              onClick={() => deleteAdminById(record.ID)}
            ></Button>
          )}
        </>
      ),
    },
    {
      title: "ลำดับ",
      dataIndex: "ID",
      key: "id",
    },
    {
      title: "ชื่อ",
      dataIndex: "Firstname",
      key: "Firstname",
    },
    {
      title: "นามสกุุล",
      dataIndex: "Lastname",
      key: "Lastname",
    },
    {
      title: "อีเมล",
      dataIndex: "Email",
      key: "Email",
    },
    {
      title: "",
      render: (record) => (
        <>
          <Button
            type="primary"
            onClick={() => navigate(`/admin/edit/${record.ID}`)}
          >
            แก้ไขข้อมูล
          </Button>
        </>
      ),
    },
  ];

  const deleteAdminById = async (id: string) => {
    let res = await DeleteAdminById(id);
    
    if (res.status == 200) {
      messageApi.open({
        type: "success",
        content: res.data.message,
      });
      await getAdmin();
    } else {
      messageApi.open({
        type: "error",
        content: res.data.error,
      });
    }
  };

  const getAdmin = async () => {
    try {
      setLoading(true);
      let res = await GetAdmin();
      console.log("Full response:", res);
      console.log("Response data:", res.data);
      
      if (res.status == 200) {
        // แก้ไขการ extract data
        let adminData = res.data;
        
        // ถ้า response มีรูปแบบ { data: [...] }
        if (res.data && res.data.data) {
          adminData = res.data.data;
        }
        
        // ตรวจสอบว่าเป็น array หรือไม่
        if (Array.isArray(adminData)) {
          // Map field names เพื่อให้ตรงกัน
          const mappedUsers = adminData.map((user: any) => ({
            ID: user.ID || user.id,
            Firstname: user.Firstname || user.firstname || user.first_name || "",
            Lastname: user.Lastname || user.lastname || user.last_name || "", 
            Email: user.Email || user.email || "",
            Birthday: user.Birthday || user.birthday || "",
          }));
          
          console.log("Mapped users:", mappedUsers);
          setUsers(mappedUsers);
        } else {
          console.log("Data is not array:", adminData);
          setUsers([]);
        }
      } else {
        setUsers([]);
        messageApi.open({
          type: "error",
          content: res.data?.error || "เกิดข้อผิดพลาดในการโหลดข้อมูล",
        });
      }
    } catch (error) {
      console.error("Error loading admin data:", error);
      setUsers([]);
      messageApi.open({
        type: "error",
        content: "เกิดข้อผิดพลาดในการเชื่อมต่อ",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAdmin();
  }, []);

  return (
    <>
      {contextHolder}
      <Row>
        <Col span={12}>
          <h2>จัดการข้อมูลสมาชิก</h2>
        </Col>

        <Col span={12} style={{ textAlign: "end", alignSelf: "center" }}>
          <Space>
            <Link to="/admin/create">
              <Button type="primary" icon={<PlusOutlined />}>
                สร้างข้อมูล
              </Button>
            </Link>
          </Space>
        </Col>
      </Row>
      <Divider />

      <div style={{ marginTop: 20 }}>
        <Table
          rowKey="ID"
          columns={columns}
          dataSource={users}
          loading={loading}
          style={{ width: "100%", overflow: "scroll" }}
        />
      </div>
    </>
  );
}

export default Admin;
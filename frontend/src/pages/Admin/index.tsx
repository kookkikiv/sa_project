import { useState, useEffect } from "react";
import { Space, Table, Button, Col, Row, Divider, message } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { GetAdmin, DeleteAdminById } from "../../services/https/index";
import { type AdminInterface } from "../../interface/IAdmin";
import { Link, useNavigate } from "react-router-dom";
import dayjs from "dayjs";

function Admin() {
  const navigate = useNavigate();
  const [admin, setadmin] = useState<AdminInterface[]>([]);
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
      dataIndex: "first_name",
      key: "first_name",
    },
    {
      title: "นามสกุุล",
      dataIndex: "last_name",
      key: "last_name",
    },
    {
      title: "อีเมล",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "วัน/เดือน/ปี เกิด",
      key: "birthday",
      render: (record) => <>{dayjs(record.birthday).format("DD/MM/YYYY")}</>,
    },
    {
      title: "อายุ",
      dataIndex: "age",
      key: "age",
    },
    {
      title: "เพศ",
      key: "gender",
      render: (record) => <>{record?.gender?.gender}</>,
    },
    {
      title: "",
      render: (record) => (
        <>
          <Button
            type="primary"
            icon={<DeleteOutlined />}
            onClick={() => navigate(`/customer/edit/${record.ID}`)}
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
      await getadmin();
    } else {
      messageApi.open({
        type: "error",
        content: res.data.error,
      });
    }
  };

  const getadmin = async () => {
    let res = await GetAdmin();

    if (res.status == 200) {
      setadmin(res.data);
    } else {
      setadmin([]);
      messageApi.open({
        type: "error",
        content: res.data.error,
      });
    }
  };


  useEffect(() => {
    getadmin();
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
          dataSource={admin}
          style={{ width: "100%", overflow: "scroll" }}
        />
      </div>
    </>
  );
}

export default Admin;
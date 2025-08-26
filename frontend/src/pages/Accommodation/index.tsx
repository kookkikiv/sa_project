import { useState, useEffect } from "react";
import { Space, Table, Button, Col, Row, Divider, message } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { GetAccommodation, DeleteAccommodationById } from "../../services/https/index";
import { type AccommodationInterface } from "../../interface/Accommodation";
import { Link, useNavigate } from "react-router-dom";

function Accommodation() {
  const navigate = useNavigate();
  const [acc, setacc] = useState<AccommodationInterface[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  const myId = localStorage.getItem("id");
  const columns: ColumnsType<AccommodationInterface> = [
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
              onClick={() => deleteAccommodationById(record.ID)}
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
      title: "ชื่อที่พัก",
      dataIndex: "Name",
      key: "Name",
    },
    {
      title: "ประเภท",
      dataIndex: "Type",
      key: "Type",
    },
        {
      title: "สถานะ",
      dataIndex: "Status",
      key: "Status",
    },
    {
      title: "",
      render: (record) => (
        <>
          <Button
            type="primary"
            icon={<DeleteOutlined />}
            onClick={() => navigate(`/accommodation/edit/${record.ID}`)}
          >
            แก้ไขข้อมูล
          </Button>
        </>
      ),
    },
  ];

  const deleteAccommodationById = async (id: string) => {
    let res = await DeleteAccommodationById(id);
    
    if (res.status == 200) {
      messageApi.open({
        type: "success",
        content: res.data.message,
      });
      await getAcc();
    } else {
      messageApi.open({
        type: "error",
        content: res.data.error,
      });
    }
  };

  const getAcc = async () => {
    let res = await GetAccommodation();

    if (res.status == 200) {
      setacc(res.data);
    } else {
      setacc([]);
      messageApi.open({
        type: "error",
        content: res.data.error,
      });
    }
  };


  useEffect(() => {
    getAcc();
  }, []);

  return (
    <>
      {contextHolder}
      <Row>
        <Col span={12}>
          <h2>จัดการข้อมูลที่พัก</h2>
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
      <Divider />

      <div style={{ marginTop: 20 }}>
        <Table
          rowKey="ID"
          columns={columns}
          dataSource={acc}
          style={{ width: "100%", overflow: "scroll" }}
        />
      </div>
    </>
  );
}

export default Accommodation;
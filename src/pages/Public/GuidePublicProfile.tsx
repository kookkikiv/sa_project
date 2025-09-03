import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Avatar, Tag, Rate, List } from "antd";

interface GuideProfile {
  id: number;
  name: string;
  age: number;
  sex: string;
  phone: string;
  email: string;
  guideType: string;
  languages: string[];
  serviceAreas: string[];
  status: string;
  photo?: string;
}

interface GuideReview {
  id: number;
  guideId: number;
  member: string;
  rating: number;
  comment: string;
  date: string;
}

const GuidePublicProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const guideId = Number(id);

  // -----------------------------
  // Mock data
  // -----------------------------
  const [guides] = useState<GuideProfile[]>([
    {
      id: 5001,
      name: "สมชาย ใจดี",
      age: 28,
      sex: "ชาย",
      phone: "0888888888",
      email: "guide01@gmail.com",
      guideType: "Local Guide",
      languages: ["อังกฤษ", "จีน"],
      serviceAreas: ["กรุงเทพฯ", "อยุธยา"],
      status: "Active",
      photo: "https://i.pravatar.cc/150?img=3",
    },
    {
      id: 5002,
      name: "สมหญิง สายบุญ",
      age: 32,
      sex: "หญิง",
      phone: "0777777777",
      email: "guide02@gmail.com",
      guideType: "General Guide",
      languages: ["ญี่ปุ่น"],
      serviceAreas: ["เชียงใหม่"],
      status: "Active",
      photo: "https://i.pravatar.cc/150?img=5",
    },
  ]);

  const [reviews] = useState<GuideReview[]>([
    {
      id: 1,
      guideId: 5001,
      member: "John Doe",
      rating: 5,
      comment: "ไกด์เก่งมาก พูดอังกฤษชัดเจน",
      date: "2025-08-20",
    },
    {
      id: 2,
      guideId: 5001,
      member: "Jane Smith",
      rating: 4,
      comment: "พาเที่ยวดี แต่ควรเพิ่มความรู้ด้านประวัติศาสตร์",
      date: "2025-08-22",
    },
    {
      id: 3,
      guideId: 5002,
      member: "Alex Kim",
      rating: 3,
      comment: "บริการโอเค แต่พูดจีนยังไม่คล่อง",
      date: "2025-08-25",
    },
  ]);

  // -----------------------------
  // Filter ข้อมูลตาม id
  // -----------------------------
  const guide = guides.find((g) => g.id === guideId);
  const guideReviews = reviews.filter((r) => r.guideId === guideId);

  if (!guide) {
    return <h2 style={{ textAlign: "center" }}>ไม่พบข้อมูลไกด์</h2>;
  }

  // คะแนนเฉลี่ย
  const avgRating =
    guideReviews.reduce((sum, r) => sum + r.rating, 0) /
    (guideReviews.length || 1);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
      <Card>
        <Card.Meta
          avatar={<Avatar size={100} src={guide.photo} />}
          title={
            <div>
              {guide.name}{" "}
              <Tag color="blue">{guide.guideType}</Tag>
            </div>
          }
          description={
            <div>
              <p>
                <b>อายุ:</b> {guide.age} | <b>เพศ:</b> {guide.sex}
              </p>
              <p>
                <b>ภาษา:</b> {guide.languages.join(", ")}
              </p>
              <p>
                <b>พื้นที่บริการ:</b> {guide.serviceAreas.join(", ")}
              </p>
              <p>
                <b>คะแนนเฉลี่ย:</b>{" "}
                <Rate disabled allowHalf value={avgRating} /> ({avgRating.toFixed(1)})
              </p>
            </div>
          }
        />
      </Card>

      <h2 style={{ marginTop: 24 }}>รีวิวนักท่องเที่ยว</h2>
      <List
        itemLayout="vertical"
        dataSource={guideReviews}
        renderItem={(review) => (
          <List.Item key={review.id}>
            <List.Item.Meta
              title={
                <div>
                  <b>{review.member}</b>{" "}
                  <span style={{ color: "#888" }}>({review.date})</span>
                </div>
              }
              description={<Rate disabled defaultValue={review.rating} />}
            />
            <div>{review.comment}</div>
          </List.Item>
        )}
      />
    </div>
  );
};

export default GuidePublicProfile;

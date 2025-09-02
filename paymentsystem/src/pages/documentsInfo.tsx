// DocumentsInfo.tsx
import React from "react";
import { Typography, Card, List, Button } from "antd";
import { motion } from "framer-motion";
import bgImage from "../assets/bangkok-thailand.jpg";

const { Title, Paragraph, Link } = Typography;

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
};

const itemVariants = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } };

const documents = [
  { name: "ID Card / Passport", description: "Official identity document for verification." },
  { name: "Guide License", description: "Your official guide license or certification." },
  { name: "CV / Resume", description: "Optional: Highlight your experience and skills." },
  { name: "Recommendation Letters", description: "Optional: Any letters supporting your application." },
];

const DocumentsInfo: React.FC = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 16px",
      }}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ width: "100%", maxWidth: 900 }}
      >
        <Card
          bordered={false}
          style={{
            borderRadius: 24,
            boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
            padding: "32px 28px",
            backgroundColor: "rgba(255,255,255,0.95)",
          }}
        >
          <motion.div variants={itemVariants}>
            <Title
              level={2}
              style={{ textAlign: "center", marginBottom: 32, fontWeight: 700, color: "#1890ff" }}
            >
              📄 Documents Information
            </Title>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Paragraph>
              To complete your guide registration, please prepare the following documents. Make sure all documents are clear and legible.
            </Paragraph>
          </motion.div>

          <motion.div variants={itemVariants}>
            <List
              itemLayout="vertical"
              dataSource={documents}
              renderItem={(doc) => (
                <List.Item>
                  <List.Item.Meta
                    title={<strong>{doc.name}</strong>}
                    description={doc.description}
                  />
                </List.Item>
              )}
            />
          </motion.div>

          <motion.div
            variants={itemVariants}
            style={{ textAlign: "center", marginTop: 24 }}
          >
            <Button type="primary" href="/guideapplication" size="large">
              Back to Registration
            </Button>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
};

export default DocumentsInfo;

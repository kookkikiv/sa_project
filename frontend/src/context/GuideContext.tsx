// src/context/GuideContext.tsx
import React, { createContext, useContext, useState } from "react";

export interface Profile {
  guideId: number;
  name: string;
  languages: string;
  area: string;
  status: "Active" | "Suspended";
}

interface GuideContextType {
  profiles: Profile[];
  updateProfile: (guideId: number, field: string, newValue: string) => void;
}

const GuideContext = createContext<GuideContextType | undefined>(undefined);

export const GuideProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<Profile[]>([
    {
      guideId: 5001,
      name: "สมชาย ใจดี",
      languages: "อังกฤษ, จีน",
      area: "กรุงเทพฯ",
      status: "Active",
    },
    {
      guideId: 5002,
      name: "สมหญิง สายบุญ",
      languages: "จีน",
      area: "เชียงใหม่",
      status: "Active",
    },
  ]);

  // ฟังก์ชันอัปเดตข้อมูลจริงของ Profiles
  const updateProfile = (guideId: number, field: string, newValue: string) => {
    setProfiles((prev) =>
      prev.map((profile) => {
        if (profile.guideId === guideId) {
          if (field === "ภาษา") {
            return { ...profile, languages: newValue };
          }
          if (field === "พื้นที่บริการ") {
            return { ...profile, area: newValue };
          }
        }
        return profile;
      })
    );
  };

  return (
    <GuideContext.Provider value={{ profiles, updateProfile }}>
      {children}
    </GuideContext.Provider>
  );
};

// hook ไว้ให้หน้าอื่นเรียกใช้
export const useGuideContext = () => {
  const context = useContext(GuideContext);
  if (!context) {
    throw new Error("useGuideContext ต้องใช้ภายใน GuideProvider");
  }
  return context;
};

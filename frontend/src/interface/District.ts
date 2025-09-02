export interface DistrictInterface {
  ID: number;
  districtCode?: string;
  districtNameTh?: string;
  districtNameEn?: string;
  province_id?: number; // ถ้า JSON เป็น provinceId/ProvinceID ปรับให้ตรง
}

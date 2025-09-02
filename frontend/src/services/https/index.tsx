// frontend/src/services/https/index.tsx
import axios from "axios";
import { type AdminInterface } from "../../interface/IAdmin";
import { type SignInInterface } from "../../interface/SignIn";
import { type AccommodationInterface } from "../../interface/Accommodation";
import { type PackageInterface } from "../../interface/Package";
import { type RoomInterface } from "../../interface/Room";
import { type FacilityInterface } from "../../interface/Facility";
import { type GuideInterface } from "../../interface/Guide";
import { type ProvinceInterface } from "../../interface/Province";
import { type DistrictInterface } from "../../interface/District";
import { type SubdistrictInterface } from "../../interface/Subdistrict";

// ===========================================
// Configuration
// ===========================================
const apiUrl = "http://localhost:8000";

// Dynamic request options with current token
const getRequestOptions = () => {
  const token = localStorage.getItem("token");
  const tokenType = localStorage.getItem("token_type");
  
  return {
    headers: {
      "Content-Type": "application/json",
      ...(token && tokenType ? { Authorization: `${tokenType} ${token}` } : {}),
    },
  };
};

// Static request options (for non-authenticated requests)
const publicRequestOptions = {
  headers: {
    "Content-Type": "application/json",
  },
};

// ===========================================
// Authentication Services
// ===========================================
async function SignIn(data: SignInInterface) {
  return await axios
    .post(`${apiUrl}/signin`, data, publicRequestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function SignUp(data: AdminInterface) {
  return await axios
    .post(`${apiUrl}/signup`, data, publicRequestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

// ===========================================
// Location Services
// ===========================================
async function GetProvince() {
  return await axios
    .get(`${apiUrl}/province`, getRequestOptions())
    .then((res) => res)
    .catch((e) => e.response);
}

async function GetProvinceById(id: string) {
  return await axios
    .get(`${apiUrl}/province/${id}`, getRequestOptions())
    .then((res) => res)
    .catch((e) => e.response);
}

async function CreateProvince(data: ProvinceInterface) {
  return await axios
    .post(`${apiUrl}/province`, data, getRequestOptions())
    .then((res) => res)
    .catch((e) => e.response);
}

async function UpdateProvinceById(id: string, data: ProvinceInterface) {
  return await axios
    .put(`${apiUrl}/province/${id}`, data, getRequestOptions())
    .then((res) => res)
    .catch((e) => e.response);
}

async function DeleteProvinceById(id: string) {
  return await axios
    .delete(`${apiUrl}/province/${id}`, getRequestOptions())
    .then((res) => res)
    .catch((e) => e.response);
}

async function GetDistrict(provinceId?: number) {
  const url = provinceId 
    ? `${apiUrl}/district?province_id=${provinceId}`
    : `${apiUrl}/district`;
  
  return await axios
    .get(url, getRequestOptions())
    .then((res) => res)
    .catch((e) => e.response);
}

async function GetDistrictById(id: string) {
  return await axios
    .get(`${apiUrl}/district/${id}`, getRequestOptions())
    .then((res) => res)
    .catch((e) => e.response);
}

async function CreateDistrict(data: DistrictInterface) {
  return await axios
    .post(`${apiUrl}/district`, data, getRequestOptions())
    .then((res) => res)
    .catch((e) => e.response);
}

async function UpdateDistrictById(id: string, data: DistrictInterface) {
  return await axios
    .put(`${apiUrl}/district/${id}`, data, getRequestOptions())
    .then((res) => res)
    .catch((e) => e.response);
}

async function DeleteDistrictById(id: string) {
  return await axios
    .delete(`${apiUrl}/district/${id}`, getRequestOptions())
    .then((res) => res)
    .catch((e) => e.response);
}

async function GetSubdistrict(districtId?: number) {
  const url = districtId 
    ? `${apiUrl}/subdistrict?district_id=${districtId}`
    : `${apiUrl}/subdistrict`;
  
  return await axios
    .get(url, getRequestOptions())
    .then((res) => res)
    .catch((e) => e.response);
}

async function GetSubdistrictById(id: string) {
  return await axios
    .get(`${apiUrl}/subdistrict/${id}`, getRequestOptions())
    .then((res) => res)
    .catch((e) => e.response);
}

async function CreateSubdistrict(data: SubdistrictInterface) {
  return await axios
    .post(`${apiUrl}/subdistrict`, data, getRequestOptions())
    .then((res) => res)
    .catch((e) => e.response);
}

async function UpdateSubdistrictById(id: string, data: SubdistrictInterface) {
  return await axios
    .put(`${apiUrl}/subdistrict/${id}`, data, getRequestOptions())
    .then((res) => res)
    .catch((e) => e.response);
}

async function DeleteSubdistrictById(id: string) {
  return await axios
    .delete(`${apiUrl}/subdistrict/${id}`, getRequestOptions())
    .then((res) => res)
    .catch((e) => e.response);
}

// ===========================================
// Admin Services
// ===========================================
async function GetAdmin() {
  return await axios
    .get(`${apiUrl}/admin`, getRequestOptions())
    .then((res) => res)
    .catch((e) => e.response);
}

async function GetAdminById(id: string) {
  return await axios
    .get(`${apiUrl}/admin/${id}`, getRequestOptions())
    .then((res) => res)
    .catch((e) => e.response);
}

async function CreateAdmin(data: AdminInterface) {
  return await axios
    .post(`${apiUrl}/admin`, data, getRequestOptions())
    .then((res) => res)
    .catch((e) => e.response);
}

async function UpdateAdminById(id: string, data: AdminInterface) {
  return await axios
    .put(`${apiUrl}/admin/${id}`, data, getRequestOptions())
    .then((res) => res)
    .catch((e) => e.response);
}

async function DeleteAdminById(id: string) {
  return await axios
    .delete(`${apiUrl}/admin/${id}`, getRequestOptions())
    .then((res) => res)
    .catch((e) => e.response);
}

// ===========================================
// Guide Services
// ===========================================
async function GetGuide() {
  return await axios
    .get(`${apiUrl}/guide`, getRequestOptions())
    .then((res) => res)
    .catch((e) => e.response);
}

async function GetGuideById(id: string) {
  return await axios
    .get(`${apiUrl}/guide/${id}`, getRequestOptions())
    .then((res) => res)
    .catch((e) => e.response);
}

async function CreateGuide(data: GuideInterface) {
  return await axios
    .post(`${apiUrl}/guide`, data, getRequestOptions())
    .then((res) => res)
    .catch((e) => e.response);
}

async function UpdateGuideById(id: string, data: GuideInterface) {
  return await axios
    .put(`${apiUrl}/guide/${id}`, data, getRequestOptions())
    .then((res) => res)
    .catch((e) => e.response);
}

async function DeleteGuideById(id: string) {
  return await axios
    .delete(`${apiUrl}/guide/${id}`, getRequestOptions())
    .then((res) => res)
    .catch((e) => e.response);
}

// ===========================================
// Accommodation Services
// ===========================================
async function GetAccommodation() {
  return await axios
    .get(`${apiUrl}/accommodation`, getRequestOptions())
    .then((res) => res)
    .catch((e) => e.response);
}

async function GetAccommodationById(id: string) {
  return await axios
    .get(`${apiUrl}/accommodation/${id}`, getRequestOptions())
    .then((res) => res)
    .catch((e) => e.response);
}

async function CreateAccommodation(data: AccommodationInterface) {
  return await axios
    .post(`${apiUrl}/accommodation`, data, getRequestOptions())
    .then((res) => res)
    .catch((e) => e.response);
}

async function UpdateAccommodationById(id: string, data: AccommodationInterface) {
  return await axios
    .put(`${apiUrl}/accommodation/${id}`, data, getRequestOptions())
    .then((res) => res)
    .catch((e) => e.response);
}

async function DeleteAccommodationById(id: string) {
  return await axios
    .delete(`${apiUrl}/accommodation/${id}`, getRequestOptions())
    .then((res) => res)
    .catch((e) => e.response);
}

// Search accommodations with filters
async function SearchAccommodation(params: {
  name?: string;
  type?: string;
  status?: string;
  province_id?: number;
  district_id?: number;
  subdistrict_id?: number;
}) {
  const queryString = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryString.append(key, String(value));
    }
  });

  return await axios
    .get(`${apiUrl}/accommodation/search?${queryString}`, getRequestOptions())
    .then((res) => res)
    .catch((e) => e.response);
}

// ===========================================
// Room Services
// ===========================================
async function GetRoom() {
  return await axios
    .get(`${apiUrl}/room`, getRequestOptions())
    .then((res) => res)
    .catch((e) => e.response);
}

async function GetRoomById(id: string) {
  return await axios
    .get(`${apiUrl}/room/${id}`, getRequestOptions())
    .then((res) => res)
    .catch((e) => e.response);
}

async function GetRoomByAccommodationId(accommodationId: string) {
  return await axios
    .get(`${apiUrl}/room?accommodation_id=${accommodationId}`, getRequestOptions())
    .then((res) => res)
    .catch((e) => e.response);
}

async function CreateRoom(data: RoomInterface) {
  return await axios
    .post(`${apiUrl}/room`, data, getRequestOptions())
    .then((res) => res)
    .catch((e) => e.response);
}

async function UpdateRoomById(id: string, data: RoomInterface) {
  return await axios
    .put(`${apiUrl}/room/${id}`, data, getRequestOptions())
    .then((res) => res)
    .catch((e) => e.response);
}

async function DeleteRoomById(id: string) {
  return await axios
    .delete(`${apiUrl}/room/${id}`, getRequestOptions())
    .then((res) => res)
    .catch((e) => e.response);
}

// Search rooms with filters
async function SearchRoom(params: {
  name?: string;
  type?: string;
  bed_type?: string;
  status?: string;
  accommodation_id?: number;
  min_price?: number;
  max_price?: number;
  people?: number;
}) {
  const queryString = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryString.append(key, String(value));
    }
  });

  return await axios
    .get(`${apiUrl}/room/search?${queryString}`, getRequestOptions())
    .then((res) => res)
    .catch((e) => e.response);
}

// ===========================================
// Facility Services
// ===========================================
async function GetFacility() {
  return await axios
    .get(`${apiUrl}/facility`, getRequestOptions())
    .then((res) => res)
    .catch((e) => e.response);
}

async function GetFacilityById(id: string) {
  return await axios
    .get(`${apiUrl}/facility/${id}`, getRequestOptions())
    .then((res) => res)
    .catch((e) => e.response);
}

async function CreateFacility(data: FacilityInterface) {
  return await axios
    .post(`${apiUrl}/facility`, data, getRequestOptions())
    .then((res) => res)
    .catch((e) => e.response);
}

async function UpdateFacilityById(id: string, data: FacilityInterface) {
  return await axios
    .put(`${apiUrl}/facility/${id}`, data, getRequestOptions())
    .then((res) => res)
    .catch((e) => e.response);
}

async function DeleteFacilityById(id: string) {
  return await axios
    .delete(`${apiUrl}/facility/${id}`, getRequestOptions())
    .then((res) => res)
    .catch((e) => e.response);
}

// ===========================================
// Package Services
// ===========================================
async function GetPackage() {
  return await axios
    .get(`${apiUrl}/package`, getRequestOptions())
    .then((res) => res)
    .catch((e) => e.response);
}

async function GetPackageById(id: string) {
  return await axios
    .get(`${apiUrl}/package/${id}`, getRequestOptions())
    .then((res) => res)
    .catch((e) => e.response);
}

async function CreatePackage(data: PackageInterface) {
  return await axios
    .post(`${apiUrl}/package`, data, getRequestOptions())
    .then((res) => res)
    .catch((e) => e.response);
}

async function UpdatePackageById(id: string, data: PackageInterface) {
  return await axios
    .put(`${apiUrl}/package/${id}`, data, getRequestOptions())
    .then((res) => res)
    .catch((e) => e.response);
}

async function DeletePackageById(id: string) {
  return await axios
    .delete(`${apiUrl}/package/${id}`, getRequestOptions())
    .then((res) => res)
    .catch((e) => e.response);
}

// Get package statistics
async function GetPackageStats() {
  return await axios
    .get(`${apiUrl}/package/stats`, getRequestOptions())
    .then((res) => res)
    .catch((e) => e.response);
}

// Search packages with filters
async function SearchPackage(params: {
  name?: string;
  min_price?: number;
  max_price?: number;
  province_id?: number;
  district_id?: number;
  subdistrict_id?: number;
  guide_id?: number;
  admin_id?: number;
  start_date?: string;
  end_date?: string;
  people?: number;
}) {
  const queryString = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryString.append(key, String(value));
    }
  });

  return await axios
    .get(`${apiUrl}/package/search?${queryString}`, getRequestOptions())
    .then((res) => res)
    .catch((e) => e.response);
}

// Get packages by accommodation
async function GetPackageByAccommodation(accommodationId: string) {
  return await axios
    .get(`${apiUrl}/package?accommodation_id=${accommodationId}`, getRequestOptions())
    .then((res) => res)
    .catch((e) => e.response);
}

// ===========================================
// Thailand Data Services
// ===========================================
async function ImportThailandData() {
  return await axios
    .post(`${apiUrl}/import-thailand-all`, {}, getRequestOptions())
    .then((res) => res)
    .catch((e) => e.response);
}

async function GetThailandStats() {
  return await axios
    .get(`${apiUrl}/thailand/stats`, getRequestOptions())
    .then((res) => res)
    .catch((e) => e.response);
}

async function ClearThailandData() {
  return await axios
    .post(`${apiUrl}/thailand/clear-data`, {}, getRequestOptions())
    .then((res) => res)
    .catch((e) => e.response);
}

// ===========================================
// Utility Services
// ===========================================

// Health check
async function HealthCheck() {
  return await axios
    .get(`${apiUrl}/health`, publicRequestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

// Validate token
async function ValidateToken() {
  return await axios
    .get(`${apiUrl}/validate`, getRequestOptions())
    .then((res) => res)
    .catch((e) => e.response);
}

// Refresh token (if implemented)
async function RefreshToken() {
  const refreshToken = localStorage.getItem("refresh_token");
  return await axios
    .post(`${apiUrl}/refresh`, { refresh_token: refreshToken }, publicRequestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

// ===========================================
// File Upload Services
// ===========================================

// Upload single file
async function UploadFile(file: File, path?: string) {
  const formData = new FormData();
  formData.append('file', file);
  if (path) formData.append('path', path);

  const token = localStorage.getItem("token");
  const tokenType = localStorage.getItem("token_type");

  return await axios
    .post(`${apiUrl}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token && tokenType ? { Authorization: `${tokenType} ${token}` } : {}),
      },
    })
    .then((res) => res)
    .catch((e) => e.response);
}

// Upload multiple files
async function UploadFiles(files: FileList, path?: string) {
  const formData = new FormData();
  Array.from(files).forEach(file => {
    formData.append('files', file);
  });
  if (path) formData.append('path', path);

  const token = localStorage.getItem("token");
  const tokenType = localStorage.getItem("token_type");

  return await axios
    .post(`${apiUrl}/upload/multiple`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token && tokenType ? { Authorization: `${tokenType} ${token}` } : {}),
      },
    })
    .then((res) => res)
    .catch((e) => e.response);
}

// ===========================================
// Export All Services
// ===========================================
export {
  // Authentication
  SignIn,
  SignUp,

  // Location Services
  GetProvince,
  GetProvinceById,
  CreateProvince,
  UpdateProvinceById,
  DeleteProvinceById,
  GetDistrict,
  GetDistrictById,
  CreateDistrict,
  UpdateDistrictById,
  DeleteDistrictById,
  GetSubdistrict,
  GetSubdistrictById,
  CreateSubdistrict,
  UpdateSubdistrictById,
  DeleteSubdistrictById,

  // Admin Services
  GetAdmin,
  GetAdminById,
  CreateAdmin,
  UpdateAdminById,
  DeleteAdminById,

  // Guide Services
  GetGuide,
  GetGuideById,
  CreateGuide,
  UpdateGuideById,
  DeleteGuideById,

  // Accommodation Services
  GetAccommodation,
  GetAccommodationById,
  CreateAccommodation,
  UpdateAccommodationById,
  DeleteAccommodationById,
  SearchAccommodation,

  // Room Services
  GetRoom,
  GetRoomById,
  GetRoomByAccommodationId,
  CreateRoom,
  UpdateRoomById,
  DeleteRoomById,
  SearchRoom,

  // Facility Services
  GetFacility,
  GetFacilityById,
  CreateFacility,
  UpdateFacilityById,
  DeleteFacilityById,

  // Package Services
  GetPackage,
  GetPackageById,
  CreatePackage,
  UpdatePackageById,
  DeletePackageById,
  GetPackageStats,
  SearchPackage,
  GetPackageByAccommodation,

  // Thailand Data Services
  ImportThailandData,
  GetThailandStats,
  ClearThailandData,

  // Utility Services
  HealthCheck,
  ValidateToken,
  RefreshToken,

  // File Upload Services
  UploadFile,
  UploadFiles,
};
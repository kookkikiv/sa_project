import { type AdminInterface } from "../../interface/IAdmin";
import { type SignInInterface } from "../../interface/SignIn";
import { type AccommodationInterface } from "../../interface/Accommodation";
import { type PackageInterface } from "../../interface/Package";
import { type RoomInterface } from "../../interface/Room";
import { type FacilityInterface } from "../../interface/Facility";

import axios from "axios";
const apiUrl = "http://localhost:8000";
const Authorization = localStorage.getItem("token");
const Bearer = localStorage.getItem("token_type");

const requestOptions = {
  headers: {
    "Content-Type": "application/json",
    Authorization: `${Bearer} ${Authorization}`,
  },
};


async function SignIn(data: SignInInterface) {
  return await axios
    .post(`${apiUrl}/signin`, data, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}


async function GetProvince() {
  return await axios
    .get(`${apiUrl}/province`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}
async function GetDistrict(provinceId: number) {
  return await axios
    .get(`${apiUrl}/district?province_id=${provinceId}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function GetSubdistrict(districtId: number) {
  return await axios
    .get(`${apiUrl}/subdistrict?district_id=${districtId}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}
async function GetGuide() {
  return await axios
    .get(`${apiUrl}/guide`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function GetAdmin() {
  return await axios
    .get(`${apiUrl}/admin`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function GetAdminById(id: string) {
  return await axios
    .get(`${apiUrl}/admin/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);

}


async function UpdateAdminById(id: string, data: AdminInterface) {
  return await axios
    .put(`${apiUrl}/admin/${id}`, data, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}


async function DeleteAdminById(id: string) {
  return await axios
    .delete(`${apiUrl}/admin/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}


async function CreateAdmin(data: AdminInterface) {
  return await axios
    .post(`${apiUrl}/signup`, data, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}
async function GetAccommodation() {
  return await axios
    .get(`${apiUrl}/accommodation`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function GetAccommodationById(id: string) {
  return await axios
    .get(`${apiUrl}/accommodation/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);

}


async function UpdateAccommodationById(id: string, data: AccommodationInterface) {
  return await axios
    .put(`${apiUrl}/accommodation/${id}`, data, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}


async function DeleteAccommodationById(id: string) {
  return await axios
    .delete(`${apiUrl}/accommodation/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}


async function CreateAccommodation(data: AccommodationInterface) {
  return await axios
    .post(`${apiUrl}/accommodation`, data, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}
async function GetPackage() {
  return await axios
    .get(`${apiUrl}/package`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}
async function GetPackageById(id: string) {
  return await axios
    .get(`${apiUrl}/package/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);

}


async function UpdatePackageById(id: string, data: PackageInterface) {
  return await axios
    .put(`${apiUrl}/package/${id}`, data, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}


async function DeletePackageById(id: string) {
  return await axios
    .delete(`${apiUrl}/package/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}


async function CreatePackage(data: PackageInterface) {
  return await axios
    .post(`${apiUrl}/package`, data, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function GetRoom() {
  return await axios
    .get(`${apiUrl}/room`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function GetRoomById(id: string) {
  return await axios
    .get(`${apiUrl}/room/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);

}


async function UpdateRoomById(id: string, data: RoomInterface) {
  return await axios
    .put(`${apiUrl}/room/${id}`, data, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}


async function DeleteRoomById(id: string) {
  return await axios
    .delete(`${apiUrl}/room/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}


async function CreateRoom(data: RoomInterface) {
  return await axios
    .post(`${apiUrl}/room`, data, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}
async function GetFacility() {
  return await axios
    .get(`${apiUrl}/facility`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function GetFacilityById(id: string) {
  return await axios
    .get(`${apiUrl}/facility/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);

}


async function UpdateFacilityById(id: string, data: FacilityInterface) {
  return await axios
    .put(`${apiUrl}/facility/${id}`, data, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}


async function DeleteFacilityById(id: string) {
  return await axios
    .delete(`${apiUrl}/facility/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}


async function CreateFacility(data: FacilityInterface) {
  return await axios
    .post(`${apiUrl}/facility`, data, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

export {
  SignIn,
  GetProvince,
  GetDistrict,
  GetSubdistrict,
  GetGuide,
  GetAdmin,
  GetAdminById,
  UpdateAdminById,
  DeleteAdminById,
  CreateAdmin,
  GetAccommodation,
  GetAccommodationById,
  UpdateAccommodationById,
  DeleteAccommodationById,
  CreateAccommodation,
  GetPackage,
  GetPackageById,
  UpdatePackageById,
  DeletePackageById,
  CreatePackage,
  GetRoom,
  GetRoomById,
  UpdateRoomById,
  DeleteRoomById,
  CreateRoom,
  GetFacility,
  GetFacilityById,
  UpdateFacilityById,
  DeleteFacilityById,
  CreateFacility,

};
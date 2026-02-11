import { data } from "react-router-dom";
import api from "./axios";

//--------------------schoool----------------------------------------------------------------------------------- 

export const signupRequest = (data) => {
  return api.post("Users/signup/", data);
};

export const verifyOtp = (data) => {
  return api.post("Users/verify-otp/", data);
};

export const loginUser = (data) => {
  return api.post("Users/login/", data);
};

export const getCurrentUser = () => {
  return api.get("Users/current-user/");
};

export const createTeacher = (data) => {
  return api.post("Profile/school-teachers/create/", data);
};

export const setPassword = (data) => {
  return api.post("Profile/set-password/", data);
};

export const listTeachers = () =>{
  return api.get('Profile/school-teachers/list/');
};

export const getTeacherDetail=(id)=>{
  return api.get(`/Profile/school-teachers/details/${id}/`);
};

export const updateTeacher = (id,data)=>{
  return api.patch(`Profile/school-teachers/update/${id}/`,data);
};


// ---------------------------------------------------------------------------------------------------------------------------
// rathod-mart-admin/frontend/src/services/userService.js
import api from "./api";

export const getUsers = async (params, signal) => {
  const res = await api.get("/users", { params, signal });
  return res.data;
};

export const getUserById = async (id, signal) => {
  const res = await api.get(`/users/${id}`, { signal });
  return res.data;
};

// --- UPDATED: Send JSON directly ---
export const createUser = async (payload) => {
  // Payload is now just a JSON object { name, email, profileImage, ... }
  const res = await api.post("/users", payload);
  return res.data;
};

export const updateUser = async (id, payload) => {
  const res = await api.put(`/users/${id}`, payload);
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await api.delete(`/users/${id}`);
  return res.data;
};

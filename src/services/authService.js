import axios from "axios";
import api from "./api";

const API_URL = import.meta.env.VITE_API_URL;

export const loginRequest = async (email, password) => {
  const formData = new URLSearchParams();

  formData.append("username", email);

  formData.append("password", password);

  const response = await axios.post(`${API_URL}/auth/login`, formData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  return response.data;
};

export const obtenerMiExpediente = async () => {
  const response = await api.get("/auth/me/expediente");

  return response.data;
};

export const actualizarMiPassword = async (data) => {
  const response = await api.patch("/auth/me/password", data);

  return response.data;
};

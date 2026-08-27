import api from "./api";

export const createLog = async (data) => {
  const res = await api.post("api/logs/create", data);
    return res.data;
};

export const getLogs = async () => {
  const res = await api.get("/api/logs/");
    return res.data;
};

export const getLogById = async (id) => {
  const res = await api.get(`/api/logs/${id}`);
    return res.data;
};

export const buyLog = async (id) => {
  const res = await api.post(`/api/logs/buy/${id}`);
    return res.data;
}

export const updateLog = async (id, data) => {
  const res = await api.put(`/api/logs/update/${id}`, data);
    return res.data;
}

export const deleteLog = async (id) => {
  const res = await api.delete(`/api/logs/delete/${id}`);
    return res.data;
}

export const getUserPurchasedApi = async () => {
    const res = await api.get(`/api/logs/my-logs`);    
    return res.data;
}
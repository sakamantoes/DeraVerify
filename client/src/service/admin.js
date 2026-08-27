import api from "./api.js";

export const getPlatformDeposits = async () => {
  const res = await api.post("/api/admin/deposit");

  return res.data;
};

export const updatePlatformDepositStatus = async (id, status) => {
  const res = await api.patch(`/api/admin/deposit/${id}`, {
    status: String(status).toLowerCase(),
  });

  return res.data;
};

export const updatePricingSettings = async (data) => {
  try {
    const response = await api.post("/api/admin/pricing/setting", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getOtpOrder = async () => {
  const res = await api.get("/api/admin/pending/otp");

  return res.data;
};

export const getAllPlatformServices = async (params = {}) => {
  const res = await api.get("/api/admin/all/platform/services", { params });

  return res.data;
};

export const getSmsPoolBalance = async () => {
  const res = await api.get("/api/admin/smspool/balance");

  return res.data;
};

export const getPlatformServiceNames = async () => {
  const res = await api.get("/api/admin/all/platform/service-name");

  return res.data;
};

export const updatePlatformServiceActiveStatus = async (service, active) => {
  const res = await api.patch(
    `/api/admin/platform/service/${encodeURIComponent(service)}/active`,
    {
      active,
    },
  );

  return res.data;
};

export const updatePlatformServiceCustomPrice = async (id, customPrice) => {
  const res = await api.patch(`/api/admin/platform/service/${id}/custom-price`, {
    customPrice,
  });

  return res.data;
};

export const refundAndEditBalance = async (id, walletBalance) => {
  const res = await api.put(`/api/admin/${id}/wallet`, { walletBalance });
  return res.data;
};

import api from "./api.js";

export const getWalletBalance = async () => {
  const res = await api.get("/api/user/wallet/balance");

  return res.data;
};
export const getAllUserDeposits = async () => {
  const res = await api.get("/api/user/wallet/deposits");

  return res.data;
};

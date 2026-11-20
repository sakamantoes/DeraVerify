import { Phone, X } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import api from "../../service/api.js";
import useAuth from "../../store/useAuth.js";

const PHONE_RE = /^(0[789]\d{9}|\+?234[789]\d{9})$/;

export default function PhoneRequiredModal({ onClose, onSaved }) {
  const { user, updateUser } = useAuth();
  const profile = user?.data || user || {};
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const valid = PHONE_RE.test(phone.replace(/\s/g, ""));

  const save = async () => {
    if (!valid) return;
    setSaving(true);
    try {
      const res = await api.put("/api/auth/update-phone", { phone });
      const saved = res.data.data.phone;
      updateUser?.({ ...profile, phone: saved });
      toast.success("Phone number saved");
      onSaved?.(saved);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Could not save phone number",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-gold-light/10 bg-panel shadow-2xl">
        <div className="flex items-start justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-gold-light to-gold-dark text-white">
              <Phone size={20} />
            </span>
            <div>
              <h2 className="text-lg font-bold text-white">
                Add your phone number
              </h2>
              <p className="mt-1 text-sm text-gray-400">
                Needed once before you can fund your wallet.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-gray-400 transition-colors hover:border-gold-light/30 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <label className="block">
            <span className="text-sm font-semibold text-gray-300">
              Phone number
            </span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08012345678"
              className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/40 px-4 text-white outline-none transition-colors placeholder:text-gray-600 focus:border-gold-light/40"
            />
          </label>

          <button
            type="button"
            onClick={save}
            disabled={!valid || saving}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-light to-gold-dark px-4 text-sm font-bold text-white transition-colors hover:brightness-110 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-gray-500"
          >
            {saving ? "Saving..." : "Save and continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
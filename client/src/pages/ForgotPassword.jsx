import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import imageObject from "../utils/image";
import { forgotPassword } from "../service/auth.js";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const getErrorMessage = (err) => {
    const message = err?.response?.data?.message;

    if (typeof message === "object") {
      return Object.values(message).find(Boolean) || "Something went wrong";
    }

    return (
      message ||
      err?.response?.data?.error ||
      err?.message ||
      "Something went wrong"
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Email address is required");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      setError("Enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await forgotPassword({ email: trimmedEmail });

      setSubmitted(true);
      toast.success(response?.message || "Password reset request received");
    } catch (error) {
      const message = getErrorMessage(error);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-red-light/10 via-transparent to-transparent" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-red-light/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 relative z-10"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-auto w-20 h-20 bg-gradient-to-br from-white to-white rounded-2xl flex items-center justify-center mb-6 shadow-xl"
          >
            <img
              src={imageObject.Logo}
              alt="Logo"
              className="w-20 h-20 rounded-full"
            />
          </motion.div>
          <h2 className="text-3xl font-bold text-white">Forgot Password</h2>
          <p className="mt-2 text-gray-400">
            Enter the email address you used to register
          </p>
          <p className="mt-3 text-sm leading-6 text-gray-500">
            A password reset link will be sent to your email. Make sure you use
            a valid email address, specifically the one you used to register.
            If you do not see the email in your inbox, check your spam folder.
            The link expires after 15 minutes.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-8 space-y-6"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                    if (submitted) setSubmitted(false);
                  }}
                  className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-lg focus:outline-none focus:border-red-light text-white transition-colors ${
                    error ? "border-red-light" : "border-red-light/20"
                  }`}
                  placeholder="you@example.com"
                />
              </div>
              {error && <p className="mt-1 text-xs text-red-light">{error}</p>}
            </div>

            {submitted && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-green-400 text-sm text-center">
                  If this email is registered, password reset instructions will
                  be sent to it.
                </p>
              </div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-gradient-to-r from-red-light to-red-dark rounded-lg font-semibold text-white shadow-lg shadow-red-light/30 hover:shadow-red-light/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Continue <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </form>

          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            Back to login
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;

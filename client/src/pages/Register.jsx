// src/pages/Register.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle,
  XCircle,
  X,
  Shield,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import imageObject from "../utils/image";
import { signup } from "../service/auth";
import GoogleButton from "../components/GoogleButton";
import { toast } from "react-toastify";

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: "",
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    hasSpecial: false,
    minLength: false,
  });

  const getErrorMessage = (err) =>
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    "Something went wrong";

  // Password strength checker
  const checkPasswordStrength = (password) => {
    const strength = {
      score: 0,
      message: "",
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      minLength: password.length >= 8,
    };

    let score = 0;
    if (strength.minLength) score++;
    if (strength.hasUpper && strength.hasLower) score++;
    if (strength.hasNumber) score++;
    if (strength.hasSpecial) score++;

    let message = "";
    if (score === 0) message = "Very Weak";
    else if (score === 1) message = "Weak";
    else if (score === 2) message = "Fair";
    else if (score === 3) message = "Good";
    else if (score === 4) message = "Strong";

    setPasswordStrength({ ...strength, score, message });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "password") {
      checkPasswordStrength(value);
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // MANDATORY: User must agree to Terms & Conditions
    if (!agreedToTerms) {
      newErrors.terms = "You must agree to the Terms & Conditions to create an account";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      localStorage.removeItem("smswinner_token");
      const response = await signup(formData);

      if (response.status === 200 || response.status === 201) {
        if (response.data?.token) {
          localStorage.setItem("smswinner_token", response.data.token);
        }

        navigate("/f/dashboard", { replace: true });
      } else {
        setErrors({ submit: response.message || "Registration failed" });
      }
    } catch (error) {
      console.error("registration erorr: ", error);
      const message = getErrorMessage(error);
      toast.error(message);
      setErrors({
        submit: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-red-light/10 via-transparent to-transparent" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-light/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 relative z-10"
      >
        {/* Header */}
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
          <h2 className="text-3xl font-bold text-white">Create Account</h2>
          <p className="mt-2 text-gray-400">Join Smswinners today</p>
        </div>

        {/* Registration Form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-8 space-y-6"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-lg focus:outline-none focus:border-red-light text-white transition-colors ${
                    errors.username ? "border-red-light" : "border-red-light/20"
                  }`}
                  placeholder="johndoe123"
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-xs text-red-light flex items-center gap-1">
                  <XCircle size={12} /> {errors.username}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-lg focus:outline-none focus:border-red-light text-white transition-colors ${
                    errors.email ? "border-red-light" : "border-red-light/20"
                  }`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-light flex items-center gap-1">
                  <XCircle size={12} /> {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-3 bg-white/5 border rounded-lg focus:outline-none focus:border-red-light text-white transition-colors ${
                    errors.password ? "border-red-light" : "border-red-light/20"
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(passwordStrength.score / 4) * 100}%`,
                        }}
                        className={`h-full rounded-full ${
                          passwordStrength.score <= 1
                            ? "bg-red-light"
                            : passwordStrength.score === 2
                              ? "bg-yellow-500"
                              : passwordStrength.score === 3
                                ? "bg-blue-500"
                                : "bg-green-500"
                        }`}
                      />
                    </div>
                    <span
                      className={`text-xs ${
                        passwordStrength.score <= 1
                          ? "text-red-light"
                          : passwordStrength.score === 2
                            ? "text-yellow-500"
                            : passwordStrength.score === 3
                              ? "text-blue-500"
                              : "text-green-500"
                      }`}
                    >
                      {passwordStrength.message}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      {passwordStrength.minLength ? (
                        <CheckCircle size={12} className="text-green-500" />
                      ) : (
                        <XCircle size={12} className="text-gray-500" />
                      )}
                      <span
                        className={
                          passwordStrength.minLength
                            ? "text-green-500"
                            : "text-gray-400"
                        }
                      >
                        8+ characters
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {passwordStrength.hasUpper &&
                      passwordStrength.hasLower ? (
                        <CheckCircle size={12} className="text-green-500" />
                      ) : (
                        <XCircle size={12} className="text-gray-500" />
                      )}
                      <span
                        className={
                          passwordStrength.hasUpper && passwordStrength.hasLower
                            ? "text-green-500"
                            : "text-gray-400"
                        }
                      >
                        Upper & Lowercase
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {passwordStrength.hasNumber ? (
                        <CheckCircle size={12} className="text-green-500" />
                      ) : (
                        <XCircle size={12} className="text-gray-500" />
                      )}
                      <span
                        className={
                          passwordStrength.hasNumber
                            ? "text-green-500"
                            : "text-gray-400"
                        }
                      >
                        Contains number
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {passwordStrength.hasSpecial ? (
                        <CheckCircle size={12} className="text-green-500" />
                      ) : (
                        <XCircle size={12} className="text-gray-500" />
                      )}
                      <span
                        className={
                          passwordStrength.hasSpecial
                            ? "text-green-500"
                            : "text-gray-400"
                        }
                      >
                        Special character
                      </span>
                    </div>
                  </div>
                </div>
              )}
              {errors.password && (
                <p className="mt-1 text-xs text-red-light">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-3 bg-white/5 border rounded-lg focus:outline-none focus:border-red-light text-white transition-colors ${
                    errors.confirmPassword
                      ? "border-red-light"
                      : "border-red-light/20"
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-light">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms and Conditions Checkbox - MANDATORY */}
            <div className={`p-3 rounded-lg transition-colors ${
              errors.terms ? "bg-red-light/10 border border-red-light/30" : "bg-white/5"
            }`}>
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => {
                    setAgreedToTerms(e.target.checked);
                    if (errors.terms) {
                      setErrors({ ...errors, terms: "" });
                    }
                  }}
                  className="mt-0.5 w-5 h-5 bg-white/10 border-2 border-red-light/30 rounded focus:ring-red-light text-red-light cursor-pointer shrink-0"
                />
                <label htmlFor="terms" className="text-sm text-gray-300 cursor-pointer">
                  I have read and agree to the{" "}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="text-red-light hover:underline font-semibold"
                  >
                    Terms & Conditions
                  </button>
                  {" "}and{" "}
                  <button
                    type="button"
                    className="text-red-light hover:underline font-semibold"
                  >
                    Privacy Policy
                  </button>
                  . <span className="text-red-light">*</span>
                </label>
              </div>
              {errors.terms && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-xs text-red-light flex items-center gap-1"
                >
                  <XCircle size={14} /> {errors.terms}
                </motion.p>
              )}
              <p className="text-xs text-gray-500 mt-1 ml-8">
                You must agree to the Terms & Conditions to create an account
              </p>
            </div>

            {errors.submit && (
              <div className="p-3 bg-red-light/10 border border-red-light/20 rounded-lg">
                <p className="text-red-light text-sm text-center">
                  {errors.submit}
                </p>
              </div>
            )}

            {/* Submit Button */}
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
                  Create Account <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Auth Button */}
          <div className="flex justify-center">
            <GoogleButton />
          </div>

          {/* Login Link */}
          <p className="text-center text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-red-light hover:text-red-400 font-semibold transition-colors"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </motion.div>

      {/* Terms and Conditions Modal */}
      <AnimatePresence>
        {showTermsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowTermsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-900 rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden border border-red-light/20"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-red-light/20">
                <div className="flex items-center gap-3">
                  <Shield className="text-red-light w-6 h-6" />
                  <h2 className="text-xl font-bold text-white">Terms & Conditions</h2>
                </div>
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6 text-gray-300 text-sm">
                <section>
                  <h3 className="font-bold text-white text-base mb-2">Payment for Services and Purchase Procedure</h3>
                  <ol className="list-decimal list-inside space-y-1 pl-2">
                    <li>Before using the Smswinners platform, you must top up your balance;</li>
                    <li>All available top-up methods can be found by clicking the "Top up" button;</li>
                    <li>The commission and minimum top-up amount depend on the selected payment method;</li>
                    <li>Please note: funds may take up to 3 hours to be credited to your balance;</li>
                    <li>Funds are deducted from the balance upon completion of the purchase;</li>
                    <li>A purchase is considered completed if an OTP code has been received and displayed to the user;</li>
                    <li>If an OTP code does not arrive for any reason, the funds are returned to the balance;</li>
                    <li>If a code does not arrive after multiple numbers purchase, Smswinners may apply sanctions to the account;</li>
                    <li>To withdraw funds from your balance, send a request to smswinner19@gmail.com from the email address that was used to register your account. Requests are reviewed within 3 business days. The standard withdrawal period is 7 days. In some cases, the review period for a withdrawal request may take up to 4 weeks.</li>
                    <li>Refunds are made to the same wallet which the deposit was made with.</li>
                    <li>A 5% fee is charged for withdrawals. If one year or more has passed since the last top-up, the fee is 15%; after 2 years – 25%; after 3 years – 35%.</li>
                  </ol>
                </section>

                <section>
                  <h4 className="font-semibold text-white">Cancellation and Refunds</h4>
                  <p className="mt-1">Cancelling a 20-minute number purchase:</p>
                  <ul className="list-disc list-inside space-y-1 pl-4">
                    <li>Number cancellation becomes available after purchase. The corresponding button in the activation card will become active;</li>
                    <li>Cancellation with a refund to your balance is available if no code has been received on the number;</li>
                    <li>Once a code has been received, the activation is considered successful and the money cannot be refunded;</li>
                    <li>If no code arrives within 20 minutes for any reason, the money is automatically returned to your balance or report to customer care.</li>
                  </ul>
                </section>

                <section>
                  <h4 className="font-semibold text-white">User Agreement</h4>
                  <ul className="list-disc list-inside space-y-1 pl-4">
                    <li>Users can purchase virtual numbers directly from suppliers through the P2P deal system.</li>
                    <li>By registering on the site, you agree to receive promotional messages from Smswinners. You can unsubscribe at any time.</li>
                    <li>Using Smswinners for any unlawful purpose is strictly forbidden.</li>
                    <li>We are not responsible for created accounts. All actions and potential blocks are the buyer's own risk.</li>
                  </ul>
                </section>

                <p className="text-gray-400 text-xs border-t border-red-light/20 pt-4">
                  For the full Terms & Conditions, please visit our{" "}
                  <Link to="/terms" className="text-red-light hover:underline" onClick={() => setShowTermsModal(false)}>
                    Terms & Conditions page
                  </Link>
                  .
                </p>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-red-light/20 flex justify-end gap-3">
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setAgreedToTerms(true);
                    if (errors.terms) {
                      setErrors({ ...errors, terms: "" });
                    }
                    setShowTermsModal(false);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-red-light to-red-dark rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-red-light/30 transition-all"
                >
                  I Agree
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Register;
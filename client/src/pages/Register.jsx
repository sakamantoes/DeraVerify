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
    <div className="min-h-screen bg-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-[#C9A24B]/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#C9A24B]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#C9A24B]/5 rounded-full blur-3xl animate-pulse delay-1000" />
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
            className="mx-auto w-40 h-20 bg-gradient-to-br from-[#000] to-[#000] rounded-2xl flex items-center justify-center mb-6 shadow-xl"
          >
            <img
              src={imageObject.Logo2}
              alt="Logo"
              className="w-40 h-20"
            />
          </motion.div>
          <h2 className="text-3xl font-bold text-white">Create Account</h2>
          <p className="mt-2 text-[#9B948A]">Join Wave Verify today</p>
        </div>

        {/* Registration Form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-[#131110] rounded-2xl p-8 space-y-6 border border-[#C9A24B]/20"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div>
              <label className="block text-[#F5EFE0] text-sm font-medium mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9B948A] w-5 h-5" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 bg-black/50 border rounded-lg focus:outline-none focus:border-[#C9A24B] text-white transition-colors ${
                    errors.username ? "border-[#C9A24B]" : "border-[#C9A24B]/20"
                  }`}
                  placeholder="johndoe123"
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-xs text-[#C9A24B] flex items-center gap-1">
                  <XCircle size={12} /> {errors.username}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-[#F5EFE0] text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9B948A] w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 bg-black/50 border rounded-lg focus:outline-none focus:border-[#C9A24B] text-white transition-colors ${
                    errors.email ? "border-[#C9A24B]" : "border-[#C9A24B]/20"
                  }`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-[#C9A24B] flex items-center gap-1">
                  <XCircle size={12} /> {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-[#F5EFE0] text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9B948A] w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-3 bg-black/50 border rounded-lg focus:outline-none focus:border-[#C9A24B] text-white transition-colors ${
                    errors.password ? "border-[#C9A24B]" : "border-[#C9A24B]/20"
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#9B948A] hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-[#1C1917] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(passwordStrength.score / 4) * 100}%`,
                        }}
                        className={`h-full rounded-full ${
                          passwordStrength.score <= 1
                            ? "bg-[#C9A24B]"
                            : passwordStrength.score === 2
                              ? "bg-[#F0CB6E]"
                              : passwordStrength.score === 3
                                ? "bg-[#C9A24B]"
                                : "bg-[#6FCF97]"
                        }`}
                      />
                    </div>
                    <span
                      className={`text-xs ${
                        passwordStrength.score <= 1
                          ? "text-[#C9A24B]"
                          : passwordStrength.score === 2
                            ? "text-[#F0CB6E]"
                            : passwordStrength.score === 3
                              ? "text-[#C9A24B]"
                              : "text-[#6FCF97]"
                      }`}
                    >
                      {passwordStrength.message}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      {passwordStrength.minLength ? (
                        <CheckCircle size={12} className="text-[#6FCF97]" />
                      ) : (
                        <XCircle size={12} className="text-[#9B948A]" />
                      )}
                      <span
                        className={
                          passwordStrength.minLength
                            ? "text-[#6FCF97]"
                            : "text-[#9B948A]"
                        }
                      >
                        8+ characters
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {passwordStrength.hasUpper &&
                      passwordStrength.hasLower ? (
                        <CheckCircle size={12} className="text-[#6FCF97]" />
                      ) : (
                        <XCircle size={12} className="text-[#9B948A]" />
                      )}
                      <span
                        className={
                          passwordStrength.hasUpper && passwordStrength.hasLower
                            ? "text-[#6FCF97]"
                            : "text-[#9B948A]"
                        }
                      >
                        Upper & Lowercase
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {passwordStrength.hasNumber ? (
                        <CheckCircle size={12} className="text-[#6FCF97]" />
                      ) : (
                        <XCircle size={12} className="text-[#9B948A]" />
                      )}
                      <span
                        className={
                          passwordStrength.hasNumber
                            ? "text-[#6FCF97]"
                            : "text-[#9B948A]"
                        }
                      >
                        Contains number
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {passwordStrength.hasSpecial ? (
                        <CheckCircle size={12} className="text-[#6FCF97]" />
                      ) : (
                        <XCircle size={12} className="text-[#9B948A]" />
                      )}
                      <span
                        className={
                          passwordStrength.hasSpecial
                            ? "text-[#6FCF97]"
                            : "text-[#9B948A]"
                        }
                      >
                        Special character
                      </span>
                    </div>
                  </div>
                </div>
              )}
              {errors.password && (
                <p className="mt-1 text-xs text-[#C9A24B]">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-[#F5EFE0] text-sm font-medium mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9B948A] w-5 h-5" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-3 bg-black/50 border rounded-lg focus:outline-none focus:border-[#C9A24B] text-white transition-colors ${
                    errors.confirmPassword
                      ? "border-[#C9A24B]"
                      : "border-[#C9A24B]/20"
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#9B948A] hover:text-white"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-[#C9A24B]">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms and Conditions Checkbox - MANDATORY */}
            <div className={`p-3 rounded-lg transition-colors ${
              errors.terms ? "bg-[#C9A24B]/10 border border-[#C9A24B]/30" : "bg-black/50"
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
                  className="mt-0.5 w-5 h-5 bg-black/10 border-2 border-[#C9A24B]/30 rounded focus:ring-[#C9A24B] text-[#C9A24B] cursor-pointer shrink-0"
                />
                <label htmlFor="terms" className="text-sm text-[#F5EFE0] cursor-pointer">
                  I have read and agree to the{" "}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="text-[#C9A24B] hover:underline font-semibold"
                  >
                    Terms & Conditions
                  </button>
                  {" "}and{" "}
                  <button
                    type="button"
                    className="text-[#C9A24B] hover:underline font-semibold"
                  >
                    Privacy Policy
                  </button>
                  . <span className="text-[#C9A24B]">*</span>
                </label>
              </div>
              {errors.terms && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-xs text-[#C9A24B] flex items-center gap-1"
                >
                  <XCircle size={14} /> {errors.terms}
                </motion.p>
              )}
              <p className="text-xs text-[#9B948A] mt-1 ml-8">
                You must agree to the Terms & Conditions to create an account
              </p>
            </div>

            {errors.submit && (
              <div className="p-3 bg-[#C9A24B]/10 border border-[#C9A24B]/20 rounded-lg">
                <p className="text-[#C9A24B] text-sm text-center">
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
              className="w-full py-3 bg-gradient-to-r from-[#C9A24B] to-[#F0CB6E] rounded-lg font-semibold text-white shadow-lg shadow-[#C9A24B]/30 hover:shadow-[#C9A24B]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
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
              <span className="px-2 bg-transparent text-[#9B948A]">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Auth Button */}
          <div className="flex justify-center">
            <GoogleButton />
          </div>

          {/* Login Link */}
          <p className="text-center text-[#9B948A]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[#C9A24B] hover:text-[#F0CB6E] font-semibold transition-colors"
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
              className="bg-[#131110] rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden border border-[#C9A24B]/20"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-[#C9A24B]/20">
                <div className="flex items-center gap-3">
                  <Shield className="text-[#C9A24B] w-6 h-6" />
                  <h2 className="text-xl font-bold text-white">Terms & Conditions</h2>
                </div>
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-[#9B948A] hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6 text-[#F5EFE0] text-sm">
                <section>
                  <h3 className="font-bold text-[#C9A24B] text-base mb-2">Payment for Services and Purchase Procedure</h3>
                  <ol className="list-decimal list-inside space-y-1 pl-2 text-[#9B948A]">
                    <li>Before using the Wave Verify platform, you must top up your balance;</li>
                    <li>All available top-up methods can be found by clicking the "Top up" button;</li>
                    <li>The commission and minimum top-up amount depend on the selected payment method;</li>
                    <li>Please note: funds may take up to 3 hours to be credited to your balance;</li>
                    <li>Funds are deducted from the balance upon completion of the purchase;</li>
                    <li>A purchase is considered completed if an OTP code has been received and displayed to the user;</li>
                    <li>If an OTP code does not arrive for any reason, the funds are returned to the balance;</li>
                    <li>If a code does not arrive after multiple numbers purchase, Wave Verify may apply sanctions to the account;</li>
                    <li>To withdraw funds from your balance, send a request to smswinner19@gmail.com from the email address that was used to register your account. Requests are reviewed within 3 business days. The standard withdrawal period is 7 days. In some cases, the review period for a withdrawal request may take up to 4 weeks.</li>
                    <li>Refunds are made to the same wallet which the deposit was made with.</li>
                    <li>A 5% fee is charged for withdrawals. If one year or more has passed since the last top-up, the fee is 15%; after 2 years – 25%; after 3 years – 35%.</li>
                  </ol>
                </section>

                <section>
                  <h4 className="font-semibold text-[#C9A24B]">Cancellation and Refunds</h4>
                  <p className="mt-1 text-[#9B948A]">Cancelling a 20-minute number purchase:</p>
                  <ul className="list-disc list-inside space-y-1 pl-4 text-[#9B948A]">
                    <li>Number cancellation becomes available after purchase. The corresponding button in the activation card will become active;</li>
                    <li>Cancellation with a refund to your balance is available if no code has been received on the number;</li>
                    <li>Once a code has been received, the activation is considered successful and the money cannot be refunded;</li>
                    <li>If no code arrives within 20 minutes for any reason, the money is automatically returned to your balance or report to customer care.</li>
                  </ul>
                </section>

                <section>
                  <h4 className="font-semibold text-[#C9A24B]">User Agreement</h4>
                  <ul className="list-disc list-inside space-y-1 pl-4 text-[#9B948A]">
                    <li>Users can purchase virtual numbers directly from suppliers through the P2P deal system.</li>
                    <li>By registering on the site, you agree to receive promotional messages from Wave Verify. You can unsubscribe at any time.</li>
                    <li>Using Wave Verify for any unlawful purpose is strictly forbidden.</li>
                    <li>We are not responsible for created accounts. All actions and potential blocks are the buyer's own risk.</li>
                  </ul>
                </section>

                <p className="text-[#9B948A] text-xs border-t border-[#C9A24B]/20 pt-4">
                  For the full Terms & Conditions, please visit our{" "}
                  <Link to="/terms" className="text-[#C9A24B] hover:underline" onClick={() => setShowTermsModal(false)}>
                    Terms & Conditions page
                  </Link>
                  .
                </p>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-[#C9A24B]/20 flex justify-end gap-3">
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
                  className="px-4 py-2 bg-gradient-to-r from-[#C9A24B] to-[#F0CB6E] rounded-lg text-black font-semibold hover:shadow-lg hover:shadow-[#C9A24B]/30 transition-all"
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
// src/pages/PrivacyPolicy.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Lock, Eye, Database, Mail, Bell, AlertTriangle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-red-light/10 via-transparent to-transparent" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-light/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/" className="inline-flex items-center text-gray-400 hover:text-red-light transition-colors mb-6">
            <ArrowLeft size={20} className="mr-2" />
            Back to Home
          </Link>

          <div className="glass-card rounded-2xl p-8 md:p-10">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="text-red-light w-8 h-8" />
              <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
            </div>
            <p className="text-gray-400 text-sm mb-8">Last updated: August 2026</p>

            <div className="space-y-8 text-gray-300">
              {/* Introduction */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Database className="text-blue-400 w-5 h-5" />
                  <h2 className="text-xl font-bold text-white">Information We Collect</h2>
                </div>
                <p className="text-sm leading-relaxed">
                  When you register on the Smswinners platform, we collect the following information:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm pl-4 mt-2">
                  <li><strong>Email Address:</strong> Your Smswinners account is identified only by the email used during registration. This is your primary identifier and is required for account recovery and communication.</li>
                  <li><strong>Username:</strong> A unique identifier you choose for your profile on the platform.</li>
                  <li><strong>Password:</strong> Encrypted and stored securely to protect your account access.</li>
                  <li><strong>Transaction Data:</strong> Information related to your purchases, deposits, and usage of our services.</li>
                </ul>
              </section>

              {/* How We Use Information */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="text-green-400 w-5 h-5" />
                  <h2 className="text-xl font-bold text-white">How We Use Your Information</h2>
                </div>
                <ul className="list-disc list-inside space-y-1 text-sm pl-4">
                  <li>To provide, maintain, and improve our virtual number and SMS verification services.</li>
                  <li>To process transactions and manage your account balance.</li>
                  <li>To send you important notifications about your account, including technical messages (password changes, security alerts) via email.</li>
                  <li>To send you marketing materials and promotional content about new services, rule changes, and other events (you may unsubscribe at any time).</li>
                  <li>To detect and prevent fraudulent activity, unauthorized access, and security vulnerabilities.</li>
                  <li>To monitor user activity and enforce platform rules and guidelines.</li>
                </ul>
              </section>

              {/* Notifications */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Bell className="text-yellow-400 w-5 h-5" />
                  <h2 className="text-xl font-bold text-white">Notifications</h2>
                </div>
                <ol className="list-decimal list-inside space-y-2 text-sm leading-relaxed">
                  <li>Important news about rule changes, new services, and other events is published in Telegram channels.</li>
                  <li>As for personal notifications, Smswinners may use the contact info you provided.</li>
                  <li>Technical messages (password change, security alerts, etc.) are sent via email. If you do not receive the expected email, check your Spam folder. If the email was marked as spam, please indicate that it is not spam to receive important messages in the future.</li>
                  <li>By registering on the website, you agree to receive marketing materials via email. You may unsubscribe at any time.</li>
                </ol>
              </section>

              {/* Data Security */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="text-red-light w-5 h-5" />
                  <h2 className="text-xl font-bold text-white">Data Security</h2>
                </div>
                <p className="text-sm leading-relaxed">
                  We take the security of your personal information seriously. Here's how we protect your data:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm pl-4 mt-2">
                  <li>All password data is encrypted using industry-standard encryption protocols.</li>
                  <li>When paying for an order with a bank card, the payment is processed (including card number entry) on a secure page of a certified payment processing system. Your confidential data (such as card details, registration information, etc.) is not sent to our platform.</li>
                  <li>The entire payment process is protected, and no one, including our platform, can access your personal or banking data.</li>
                  <li>When handling card data, the system complies with the Payment Card Industry Data Security Standard (PCI DSS), a global security standard developed by major payment systems such as Visa and MasterCard.</li>
                  <li>The data transmission technology ensures the safety of card transactions using Secure Sockets Layer (SSL) encryption, Verified by Visa, SecureCode, and closed banking networks with the highest level of protection.</li>
                </ul>
              </section>

              {/* Account Security */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="text-orange-400 w-5 h-5" />
                  <h2 className="text-xl font-bold text-white">Account Security</h2>
                </div>
                <p className="text-sm leading-relaxed">
                  For security reasons, your account may be frozen in the following cases:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm pl-4 mt-2">
                  <li>No activity for 3 months.</li>
                  <li>Suspicious or third-party access detected.</li>
                </ul>
                <p className="text-sm mt-2">
                  Account recovery is possible only with the original email that you specified during registration. We do not store any identifiable information beyond what is necessary for platform functionality.
                </p>
              </section>

              {/* Reseller Privacy */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="text-purple-400 w-5 h-5" />
                  <h2 className="text-xl font-bold text-white">Reseller Privacy</h2>
                </div>
                <ul className="list-disc list-inside space-y-1 text-sm pl-4">
                  <li>Resellers can develop their own brand, conduct promotions, and perform any actions to attract customers without coordinating this activity with Smswinners (with the exception of knowingly illegal actions or use for hosting illegal platforms).</li>
                  <li>Technical support for users purchasing numbers from a Reseller is the responsibility of the Reseller.</li>
                  <li>Resellers are prohibited from creating services that copy or resemble Smswinners identity: name, logo, color palette, and other brand book elements.</li>
                  <li>Resellers are prohibited from directing buyers to Smswinners technical support or referring to Smswinners in the event of disputed situations.</li>
                </ul>
              </section>

              {/* Your Rights */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Mail className="text-pink-400 w-5 h-5" />
                  <h2 className="text-xl font-bold text-white">Your Rights</h2>
                </div>
                <p className="text-sm leading-relaxed">You have the following rights regarding your personal data:</p>
                <ul className="list-disc list-inside space-y-1 text-sm pl-4 mt-2">
                  <li><strong>Access:</strong> You can request access to the personal data we hold about you.</li>
                  <li><strong>Correction:</strong> You can update your account information at any time through your account settings.</li>
                  <li><strong>Unsubscribe:</strong> You may opt out of marketing communications at any time.</li>
                  <li><strong>Account Closure:</strong> You may close your account by contacting us at <a href="mailto:Smswinner19@gmail.com" className="text-red-light hover:underline">Smswinner19@gmail.com</a>.</li>
                </ul>
              </section>

              {/* Data Retention */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Database className="text-teal-400 w-5 h-5" />
                  <h2 className="text-xl font-bold text-white">Data Retention</h2>
                </div>
                <p className="text-sm leading-relaxed">
                  We retain your personal data for as long as your account is active or as needed to provide you with our services. If you wish to cancel your account or request that we no longer use your data to provide you with services, contact us at <a href="mailto:Smswinner19@gmail.com" className="text-red-light hover:underline">Smswinner19@gmail.com</a>. We will retain and use your information as necessary to comply with our legal obligations, resolve disputes, and enforce our agreements.
                </p>
              </section>

              {/* Cookies and Tracking */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="text-cyan-400 w-5 h-5" />
                  <h2 className="text-xl font-bold text-white">Cookies and Tracking</h2>
                </div>
                <p className="text-sm leading-relaxed">
                  We use cookies and similar tracking technologies to:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm pl-4 mt-2">
                  <li>Maintain your session and keep you logged in.</li>
                  <li>Remember your preferences and settings.</li>
                  <li>Understand how you interact with our platform to improve user experience.</li>
                  <li>Prevent fraud and enhance security.</li>
                </ul>
              </section>

              {/* Prohibited Use */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="text-red-400 w-5 h-5" />
                  <h2 className="text-xl font-bold text-white">Prohibited Use</h2>
                </div>
                <p className="text-sm leading-relaxed">
                  Using Smswinners for any unlawful purpose is strictly forbidden. The platform must not be used for:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm pl-4 mt-2">
                  <li>Paid subscription services.</li>
                  <li>Activations of Webmoney.</li>
                  <li>Banking services.</li>
                  <li>Any illegal activity or purpose.</li>
                </ul>
                <p className="text-sm mt-2">
                  Any exploitation of bugs or security vulnerabilities is strictly forbidden by law.
                </p>
              </section>

              {/* Changes to Privacy Policy */}
              <section>
                <h2 className="text-xl font-bold text-white mb-2">Changes to This Privacy Policy</h2>
                <p className="text-sm leading-relaxed">
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date at the top. You are advised to review this Privacy Policy periodically for any changes.
                </p>
              </section>

              {/* Contact Information */}
              <section className="border-t border-red-light/20 pt-6">
                <h2 className="text-xl font-bold text-white mb-2">Contact Us</h2>
                <p className="text-sm leading-relaxed">
                  If you have any questions about this Privacy Policy, please contact us:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm pl-4 mt-2">
                  <li>Email: <a href="mailto:Smswinner19@gmail.com" className="text-red-light hover:underline">Smswinner19@gmail.com</a></li>
                  <li>Telegram: <span className="text-red-light">@@smswinnerssupport</span></li>
                </ul>
              </section>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
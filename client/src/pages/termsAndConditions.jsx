// src/pages/TermsAndConditions.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, CreditCard, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsAndConditions = () => {
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
              <h1 className="text-3xl font-bold text-white">Terms & Conditions</h1>
            </div>
            <p className="text-gray-400 text-sm mb-8">Last updated: August 2026</p>

            <div className="space-y-8 text-gray-300">
              {/* Payment Section */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="text-red-light w-5 h-5" />
                  <h2 className="text-xl font-bold text-white">Payment for Services and Purchase Procedure</h2>
                </div>
                <ol className="list-decimal list-inside space-y-2 text-sm leading-relaxed">
                  <li>Before using the Smswinners platform, you must top up your balance;</li>
                  <li>All available top-up methods can be found by clicking the "Top up" button;</li>
                  <li>The commission and minimum top-up amount depend on the selected payment method;</li>
                  <li>Please note: funds may take up to 3 hours to be credited to your balance;</li>
                  <li>Funds are deducted from the balance upon completion of the purchase;</li>
                  <li>A purchase is considered completed if an OTP code has been received and displayed to the user;</li>
                  <li>If an OTP code does not arrive for any reason, the funds are returned to the balance;</li>
                  <li>If a code does not arrive after multiple numbers purchase, Smswinners may apply sanctions to the account;</li>
                  <li>To withdraw funds from your balance, send a request to <a href="mailto:smswinner19@gmail.com" className="text-red-light hover:underline">smswinner19@gmail.com</a> from the email address that was used to register your account. Requests are reviewed within 3 business days. The standard withdrawal period is 7 days. In some cases, the review period for a withdrawal request may take up to 4 weeks.</li>
                  <li>Refunds are made to the same wallet which the deposit was made with.</li>
                  <li>A 5% fee is charged for withdrawals. If one year or more has passed since the last top-up, the fee is 15%; after 2 years – 25%; after 3 years – 35%.</li>
                </ol>
              </section>

              {/* Why Money Wasn't Credited */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="text-yellow-500 w-5 h-5" />
                  <h2 className="text-xl font-bold text-white">Why money wasn't credited to the balance</h2>
                </div>
                <p className="text-sm mb-2">If the funds are topped up correctly, they are credited to the balance automatically. The maximum waiting time is 3 hours.</p>
                <p className="text-sm mb-2">Funds crediting problems may occur if you have not met the terms of the top up:</p>
                <ul className="list-disc list-inside space-y-1 text-sm pl-4">
                  <li>Topped up the amount which is less than the minimum one (the minimum amount is indicated when replenishing after choosing a method);</li>
                  <li>You chose a method of top up with a certain payment gateway, but paid with another one;</li>
                  <li>The network you selected doesn't match the one you used for the payment.</li>
                </ul>
                <p className="text-sm mt-2">Please, follow the instructions so as not to wait for the issue to be resolved by the technical support.</p>
              </section>

              {/* Cancellation and Refunds */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Info className="text-blue-400 w-5 h-5" />
                  <h2 className="text-xl font-bold text-white">Cancellation and Refunds</h2>
                </div>
                <h3 className="font-semibold text-white text-sm mb-2">Cancelling a 20-minute number purchase</h3>
                <ul className="list-disc list-inside space-y-1 text-sm pl-4">
                  <li>Number cancellation becomes available after purchase. The corresponding button in the activation card will become active;</li>
                  <li>Cancellation with a refund to your balance is available if no code has been received on the number;</li>
                  <li>Once a code has been received, the activation is considered successful and the money cannot be refunded.</li>
                  <li>If no code arrives within 20 minutes for any reason, the money is automatically returned to your balance or report to customer care.</li>
                </ul>

                <h3 className="font-semibold text-white text-sm mt-4 mb-2">Special cases</h3>
                <ul className="list-disc list-inside space-y-1 text-sm pl-4">
                  <li>In certain cases of provider-side errors, the money for the number can be refunded through technical support. Such cases include 2FA requirements, an account already registered on the purchased number, and similar situations;</li>
                  <li>A code not arriving is a disputed situation, and the cause may be on the user's side. Such cases are reviewed individually;</li>
                  <li>Be prepared to support your case with screenshots and a video of the registration process from the moment the number was purchased;</li>
                  <li>Technical support reviews each case individually. This is how we protect the interests of both the user and the provider.</li>
                </ul>
              </section>

              {/* Notifications */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="text-green-400 w-5 h-5" />
                  <h2 className="text-xl font-bold text-white">Notifications</h2>
                </div>
                <ol className="list-decimal list-inside space-y-2 text-sm leading-relaxed">
                  <li>Important news about rule changes, new services, and other events is published in Telegram channels;</li>
                  <li>As for personal notifications, Smswinners may use the contact info you provided;</li>
                  <li>Technical messages (password change) are sent via email. If you do not receive the expected email, check your Spam folder. If the email was marked as spam, please indicate that it is not spam to receive important messages in the future;</li>
                  <li>By registering on the website, you agree to receive marketing materials via email. You may unsubscribe at any time.</li>
                </ol>
              </section>

              {/* Reseller Summary */}
              <section>
                <h2 className="text-xl font-bold text-white mb-4">Reseller Summary</h2>
                <ol className="list-decimal list-inside space-y-2 text-sm leading-relaxed">
                  <li>Standard auto-refund rules apply to Resellers:
                    <ul className="list-disc list-inside pl-6 mt-1">
                      <li>Upon activation, the cost of the number is returned to the balance after 20 minutes if no confirmation code is received;</li>
                      <li>When renting a number, the rental can be manually canceled within 20 minutes if the code is not received.</li>
                    </ul>
                  </li>
                  <li>The markup on numbers is not regulated by Smswinners and remains at the Reseller's discretion.</li>
                  <li>Resellers can develop their own brand, conduct promotions, and perform any actions to attract customers without coordinating this activity with Smswinners. Exception: knowingly illegal actions, use for hosting illegal platforms.</li>
                  <li>The price at which a Reseller purchases numbers does not differ from the price for other users.</li>
                  <li>Technical support for users purchasing numbers from a Reseller is the responsibility of the Reseller.</li>
                  <li>The sale of virtual numbers is illegal in a number of states. Responsibility for potential risks of illegal distribution lies with the Reseller.</li>
                </ol>

                <h3 className="font-semibold text-white text-sm mt-4 mb-2">Prohibited:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm pl-4">
                  <li>Creating services for selling numbers that copy or resemble Smswinners identity: name, logo, color palette, and other brand book elements.</li>
                  <li>Directing buyers to Smswinners technical support.</li>
                  <li>Referring to Smswinners in the event of disputed situations.</li>
                  <li>Selling numbers for knowingly illegal purposes.</li>
                </ul>
                <p className="text-sm mt-2">In case of identified violations, Smswinners reserves the right to apply sanctions against the Reseller: blocking, cancellation of discounts, etc., depending on the violation and the damage caused.</p>
              </section>

              {/* User Agreement */}
              <section>
                <h2 className="text-xl font-bold text-white mb-4">User Agreement</h2>

                <h3 className="font-semibold text-white text-sm mb-2">1. General Terms</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm pl-4">
                  <li>Users can purchase virtual numbers directly from suppliers through the P2P deal system.</li>
                  <li>Public deals are offers from suppliers available to all users. Any user can accept and join such a deal.</li>
                  <li>As part of a deal, the supplier provides a phone number for remote SMS reception via Smswinners software.</li>
                  <li>The Smswinners platform is not a guarantor of any deal. It only provides the interface for such deals.</li>
                  <li>Smswinners reserves the right to monitor user and supplier activity and exclude them in case of repeated violations of the platform rules.</li>
                </ol>

                <h3 className="font-semibold text-white text-sm mt-4 mb-2">2. How the Deal Works</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm pl-4">
                  <li>Use filters (by service or country) to find suitable suppliers.</li>
                  <li>Choose a service in the menu and click 'Buy', use the provided number, confirm that the SMS was received.</li>
                  <li>If everything is correct and you're satisfied, click 'Finish' — or wait 15 minutes for automatic completion.</li>
                  <li>Maximum SMS waiting time is 20 minutes. After that, the number use period will be finished.</li>
                </ol>

                <h3 className="font-semibold text-white text-sm mt-4 mb-2">3. Activation Fees</h3>
                <p className="text-sm pl-4">Activation fees are deducted based on the displayed price list. Charges are applied after completing the transaction.</p>

                <h3 className="font-semibold text-white text-sm mt-4 mb-2">4. Cancellation</h3>
                <p className="text-sm pl-4">If a number was provided but not used (no code received), you may cancel at any time without penalty. Abuse may lead to moderation actions.</p>

                <h3 className="font-semibold text-white text-sm mt-4 mb-2">5. Promotional Messages</h3>
                <p className="text-sm pl-4">By registering on the site, you agree to receive promotional messages from Smswinners. You can unsubscribe at any time.</p>

                <h3 className="font-semibold text-white text-sm mt-4 mb-2">6. Prohibited Use</h3>
                <p className="text-sm pl-4">Using Smswinners for any unlawful purpose is strictly forbidden. The platform must not be used for paid subscription services.</p>

                <h3 className="font-semibold text-white text-sm mt-4 mb-2">7. Account Responsibility</h3>
                <p className="text-sm pl-4">We are not responsible for created accounts. All actions and potential blocks are the buyer's own risk.</p>
                <ul className="list-disc list-inside space-y-1 text-sm pl-8">
                  <li>Activations of Webmoney are prohibited.</li>
                  <li>Activations for banking services are prohibited.</li>
                </ul>

                <h3 className="font-semibold text-white text-sm mt-4 mb-2">8. Refunds</h3>
                <p className="text-sm pl-4">Refunds are only possible by request from the email that you have registered with to: <a href="mailto:Smswinner19@gmail.com" className="text-red-light hover:underline">Smswinner19@gmail.com</a>, or via Telegram <span className="text-red-light">@@smswinnerssupport</span>. Refunds are processed only to the original payment card in the same currency.</p>

                <h3 className="font-semibold text-white text-sm mt-4 mb-2">9. Payment Security</h3>
                <p className="text-sm pl-4">When paying for an order with a bank card, the payment is processed (including card number entry) on a secure page of a certified payment processing system. This means that your confidential data (such as card details, registration information, etc.) is not sent to the online store. The entire process is protected, and no one, including our platform, can access your personal or banking data. When handling card data, the system complies with the Payment Card Industry Data Security Standard (PCI DSS), a global security standard developed by major payment systems such as Visa and MasterCard. The data transmission technology ensures the safety of card transactions using Secure Sockets Layer (SSL) encryption, Verified by Visa, SecureCode, and closed banking networks with the highest level of protection.</p>

                <h3 className="font-semibold text-white text-sm mt-4 mb-2">10. Security Vulnerabilities</h3>
                <p className="text-sm pl-4">Any exploitation of bugs or security vulnerabilities is strictly forbidden by law.</p>

                <h3 className="font-semibold text-white text-sm mt-4 mb-2">11. Account Identification</h3>
                <p className="text-sm pl-4">Your Smswinners account is identified only by the email used during registration.</p>

                <h3 className="font-semibold text-white text-sm mt-4 mb-2">12. Account Freezing</h3>
                <p className="text-sm pl-4">For security reasons, your account may be frozen in the following cases:</p>
                <ul className="list-disc list-inside space-y-1 text-sm pl-8">
                  <li>No activity for 3 months.</li>
                  <li>Suspicious or third-party access detected.</li>
                </ul>

                <h3 className="font-semibold text-white text-sm mt-4 mb-2">13. Account Recovery</h3>
                <p className="text-sm pl-4">Account recovery is possible only with the original email that you specified during registration.</p>
              </section>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
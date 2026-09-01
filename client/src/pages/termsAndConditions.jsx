// TermsAndConditions.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, CheckCircle, ArrowRight, Home } from 'lucide-react';
import imageObject from '../utils/image';

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-[#0A0908] text-[#F5EFE0]">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(201,162,75,0.06)_0%,_transparent_70%)]" />
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: `
            linear-gradient(rgba(201,162,75,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201,162,75,0.3) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }} />
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-[#C9A24B]/25 bg-[#0A0908]/85 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
          <img src={imageObject.Logo2} alt="wave verify" className='w-[70px]' />
            <span className="font-bold text-lg tracking-wide text-[#F5EFE0]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Wave Verify
            </span>
          </Link>
          <Link to="/" className="text-[#9B948A] hover:text-[#F0CB6E] transition-colors text-sm flex items-center gap-2">
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-16 md:py-24">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C9A24B]/35 px-4 py-1.5 text-xs text-[#F0CB6E] mb-4">
            <Shield className="h-3.5 w-3.5" />
            Legal Document
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Terms & <span className="text-[#F0CB6E]">Conditions</span>
          </h1>
          <p className="text-[#9B948A] text-sm">Last Updated: September 1, 2026</p>
        </div>

        <div className="space-y-8">
          {/* Introduction */}
          <section className="bg-[#131110]/80 backdrop-blur-sm rounded-2xl border border-[#C9A24B]/20 p-6 md:p-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              <CheckCircle className="h-5 w-5 text-[#6FCF97]" />
              1. Acceptance of Terms
            </h2>
            <p className="text-[#9B948A] leading-relaxed text-sm md:text-base">
              By accessing and using this website and our services, you agree to be bound by these Terms and Conditions. 
              If you do not agree with any part of these terms, please do not use our services. We reserve the right to 
              update these terms at any time, and your continued use constitutes acceptance of any changes.
            </p>
          </section>

          {/* Services */}
          <section className="bg-[#131110]/80 backdrop-blur-sm rounded-2xl border border-[#C9A24B]/20 p-6 md:p-8">
            <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              2. Description of Services
            </h2>
            <p className="text-[#9B948A] leading-relaxed text-sm md:text-base mb-4">
              We provide temporary phone number services for verification purposes. Our platform allows users to:
            </p>
            <ul className="space-y-3 text-[#9B948A] text-sm md:text-base">
              <li className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-[#6FCF97] mt-1 flex-shrink-0" />
                <span>Rent real, carrier-verified phone numbers from multiple countries</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-[#6FCF97] mt-1 flex-shrink-0" />
                <span>Receive SMS verification codes for various platforms</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-[#6FCF97] mt-1 flex-shrink-0" />
                <span>Access numbers for short-term or extended rental periods</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-[#6FCF97] mt-1 flex-shrink-0" />
                <span>Manage verifications through our dashboard</span>
              </li>
            </ul>
          </section>

          {/* User Responsibilities */}
          <section className="bg-[#131110]/80 backdrop-blur-sm rounded-2xl border border-[#C9A24B]/20 p-6 md:p-8">
            <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              3. User Responsibilities
            </h2>
            <p className="text-[#9B948A] leading-relaxed text-sm md:text-base mb-4">
              As a user, you agree to:
            </p>
            <ul className="space-y-3 text-[#9B948A] text-sm md:text-base">
              <li className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-[#6FCF97] mt-1 flex-shrink-0" />
                <span>Provide accurate and complete information when creating an account</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-[#6FCF97] mt-1 flex-shrink-0" />
                <span>Use our services only for legitimate verification purposes</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-[#6FCF97] mt-1 flex-shrink-0" />
                <span>Not use our services for any illegal, fraudulent, or harmful activities</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-[#6FCF97] mt-1 flex-shrink-0" />
                <span>Maintain the security of your account credentials</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-[#6FCF97] mt-1 flex-shrink-0" />
                <span>Notify us immediately of any unauthorized use of your account</span>
              </li>
            </ul>
          </section>

          {/* Payments */}
          <section className="bg-[#131110]/80 backdrop-blur-sm rounded-2xl border border-[#C9A24B]/20 p-6 md:p-8">
            <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              4. Payments and Refunds
            </h2>
            <p className="text-[#9B948A] leading-relaxed text-sm md:text-base">
              Our services are offered on a pay-per-use or subscription basis. All payments are processed securely 
              through our payment partners. We do not store your payment information. Refunds may be issued at our 
              discretion for failed verifications or technical issues. Please contact our support team for any 
              payment-related inquiries.
            </p>
          </section>

          {/* Intellectual Property */}
          <section className="bg-[#131110]/80 backdrop-blur-sm rounded-2xl border border-[#C9A24B]/20 p-6 md:p-8">
            <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              5. Intellectual Property
            </h2>
            <p className="text-[#9B948A] leading-relaxed text-sm md:text-base">
              All content, features, and functionality on this platform, including but not limited to text, graphics, 
              logos, and software, are the exclusive property of Wave Verify and are protected by copyright, trademark, 
              and other intellectual property laws. You may not copy, modify, distribute, or create derivative works 
              without our explicit written consent.
            </p>
          </section>

          {/* Privacy */}
          <section className="bg-[#131110]/80 backdrop-blur-sm rounded-2xl border border-[#C9A24B]/20 p-6 md:p-8">
            <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              6. Privacy Policy
            </h2>
            <p className="text-[#9B948A] leading-relaxed text-sm md:text-base">
              Your privacy is important to us. Please review our separate <Link to="/privacy" className="text-[#F0CB6E] hover:underline">Privacy Policy</Link> 
              to understand how we collect, use, and protect your personal information.
            </p>
          </section>

          {/* Limitations */}
          <section className="bg-[#131110]/80 backdrop-blur-sm rounded-2xl border border-[#C9A24B]/20 p-6 md:p-8">
            <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              7. Limitations of Liability
            </h2>
            <p className="text-[#9B948A] leading-relaxed text-sm md:text-base">
              Our services are provided "as is" without warranties of any kind. We do not guarantee that our services 
              will be uninterrupted, error-free, or completely secure. To the fullest extent permitted by law, we shall 
              not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your 
              use of our services.
            </p>
          </section>

          {/* Termination */}
          <section className="bg-[#131110]/80 backdrop-blur-sm rounded-2xl border border-[#C9A24B]/20 p-6 md:p-8">
            <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              8. Termination
            </h2>
            <p className="text-[#9B948A] leading-relaxed text-sm md:text-base">
              We reserve the right to suspend or terminate your account at any time for violation of these terms, 
              illegal activities, or at our sole discretion. Upon termination, you must immediately cease using our 
              services and any outstanding fees will become due.
            </p>
          </section>

          {/* Governing Law */}
          <section className="bg-[#131110]/80 backdrop-blur-sm rounded-2xl border border-[#C9A24B]/20 p-6 md:p-8">
            <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              9. Governing Law
            </h2>
            <p className="text-[#9B948A] leading-relaxed text-sm md:text-base">
              These terms shall be governed by and construed in accordance with the laws of the jurisdiction in which 
              our company is registered, without regard to its conflict of law provisions. Any disputes arising under 
              these terms shall be subject to the exclusive jurisdiction of the courts in that jurisdiction.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-[#131110]/80 backdrop-blur-sm rounded-2xl border border-[#C9A24B]/20 p-6 md:p-8">
            <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              10. Contact Us
            </h2>
            <p className="text-[#9B948A] leading-relaxed text-sm md:text-base">
              If you have any questions about these Terms and Conditions, please contact us at:
            </p>
            <div className="mt-4 p-4 rounded-lg border border-[#C9A24B]/20 bg-[#0A0908]/50">
              <p className="text-[#F5EFE0] font-mono text-sm">📧 support@waveverify.com</p>
              <p className="text-[#F5EFE0] font-mono text-sm mt-1">🌐 www.waveverify.com</p>
            </div>
          </section>

          {/* CTA */}
          <div className="text-center pt-4">
            <Link to="/" className="inline-flex items-center gap-2 bg-[#C9A24B] text-[#0A0908] px-8 py-3 rounded-lg font-medium hover:scale-105 transition-transform text-sm">
              Return to Home
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#C9A24B]/15 bg-[#131110] px-6 py-8 mt-8">
        <div className="mx-auto max-w-4xl text-center text-xs text-[#9B948A]">
          © {new Date().getFullYear()} Wave Verify. All rights reserved.
          <div className="flex justify-center gap-6 mt-2">
            <Link to="/terms" className="hover:text-[#F0CB6E] transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-[#F0CB6E] transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TermsAndConditions;
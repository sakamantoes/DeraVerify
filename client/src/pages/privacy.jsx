// Privacy.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, CheckCircle, ArrowRight, Home, Lock, User, Eye, Cookie } from 'lucide-react';
import imageObject from '../utils/image';

const Privacy = () => {
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
            <Lock className="h-3.5 w-3.5" />
            Privacy Policy
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Privacy <span className="text-[#F0CB6E]">Policy</span>
          </h1>
          <p className="text-[#9B948A] text-sm">Last Updated: September 1, 2026</p>
        </div>

        <div className="space-y-8">
          {/* Introduction */}
          <section className="bg-[#131110]/80 backdrop-blur-sm rounded-2xl border border-[#C9A24B]/20 p-6 md:p-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              <Shield className="h-5 w-5 text-[#6FCF97]" />
              Our Commitment to Privacy
            </h2>
            <p className="text-[#9B948A] leading-relaxed text-sm md:text-base">
              Your privacy is a priority for us. This Privacy Policy explains how we collect, use, disclose, and 
              safeguard your information when you use our services. Please read this policy carefully. By using 
              our services, you consent to the practices described herein.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="bg-[#131110]/80 backdrop-blur-sm rounded-2xl border border-[#C9A24B]/20 p-6 md:p-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              <User className="h-5 w-5 text-[#F0CB6E]" />
              Information We Collect
            </h2>
            <p className="text-[#9B948A] leading-relaxed text-sm md:text-base mb-4">
              We collect the following types of information:
            </p>
            <ul className="space-y-3 text-[#9B948A] text-sm md:text-base">
              <li className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-[#6FCF97] mt-1 flex-shrink-0" />
                <span><strong className="text-[#F5EFE0]">Personal Information:</strong> Name, email address, phone number, and payment information when you create an account or make a purchase.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-[#6FCF97] mt-1 flex-shrink-0" />
                <span><strong className="text-[#F5EFE0]">Usage Data:</strong> Information about how you interact with our platform, including pages visited, features used, and time spent.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-[#6FCF97] mt-1 flex-shrink-0" />
                <span><strong className="text-[#F5EFE0]">Device Information:</strong> IP address, browser type, operating system, and device identifiers.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-[#6FCF97] mt-1 flex-shrink-0" />
                <span><strong className="text-[#F5EFE0]">Cookies:</strong> We use cookies and similar tracking technologies to enhance your experience and analyze usage patterns.</span>
              </li>
            </ul>
          </section>

          {/* How We Use Information */}
          <section className="bg-[#131110]/80 backdrop-blur-sm rounded-2xl border border-[#C9A24B]/20 p-6 md:p-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              <Eye className="h-5 w-5 text-[#F0CB6E]" />
              How We Use Your Information
            </h2>
            <p className="text-[#9B948A] leading-relaxed text-sm md:text-base mb-4">
              We use the information we collect for the following purposes:
            </p>
            <ul className="space-y-3 text-[#9B948A] text-sm md:text-base">
              <li className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-[#6FCF97] mt-1 flex-shrink-0" />
                <span>To provide, maintain, and improve our services</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-[#6FCF97] mt-1 flex-shrink-0" />
                <span>To process transactions and send related confirmations</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-[#6FCF97] mt-1 flex-shrink-0" />
                <span>To send you updates, security alerts, and support messages</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-[#6FCF97] mt-1 flex-shrink-0" />
                <span>To monitor and analyze usage trends and improve user experience</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-[#6FCF97] mt-1 flex-shrink-0" />
                <span>To detect, prevent, and address technical issues or security breaches</span>
              </li>
            </ul>
          </section>

          {/* Data Sharing */}
          <section className="bg-[#131110]/80 backdrop-blur-sm rounded-2xl border border-[#C9A24B]/20 p-6 md:p-8">
            <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Data Sharing and Disclosure
            </h2>
            <p className="text-[#9B948A] leading-relaxed text-sm md:text-base">
              We do not sell, trade, or rent your personal information to third parties. We may share your information:
            </p>
            <ul className="mt-4 space-y-3 text-[#9B948A] text-sm md:text-base">
              <li className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-[#6FCF97] mt-1 flex-shrink-0" />
                <span>With trusted third-party service providers who assist in operating our platform (payment processors, hosting services, etc.)</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-[#6FCF97] mt-1 flex-shrink-0" />
                <span>When required by law, regulation, or legal process</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-[#6FCF97] mt-1 flex-shrink-0" />
                <span>To protect the rights, property, or safety of our users or the public</span>
              </li>
            </ul>
          </section>

          {/* Data Security */}
          <section className="bg-[#131110]/80 backdrop-blur-sm rounded-2xl border border-[#C9A24B]/20 p-6 md:p-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              <Lock className="h-5 w-5 text-[#6FCF97]" />
              Data Security
            </h2>
            <p className="text-[#9B948A] leading-relaxed text-sm md:text-base">
              We implement appropriate technical and organizational measures to protect your personal information 
              against unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure 
              data storage, and regular security audits. However, no method of transmission over the internet is 
              100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          {/* Cookies */}
          <section className="bg-[#131110]/80 backdrop-blur-sm rounded-2xl border border-[#C9A24B]/20 p-6 md:p-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              <Cookie className="h-5 w-5 text-[#F0CB6E]" />
              Cookies and Tracking
            </h2>
            <p className="text-[#9B948A] leading-relaxed text-sm md:text-base">
              We use cookies and similar tracking technologies to enhance your experience, personalize content, 
              and analyze our traffic. You can control cookie preferences in your browser settings. Please note 
              that disabling cookies may affect the functionality of our platform.
            </p>
          </section>

          {/* User Rights */}
          <section className="bg-[#131110]/80 backdrop-blur-sm rounded-2xl border border-[#C9A24B]/20 p-6 md:p-8">
            <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Your Rights and Choices
            </h2>
            <p className="text-[#9B948A] leading-relaxed text-sm md:text-base">
              You have the right to:
            </p>
            <ul className="mt-4 space-y-3 text-[#9B948A] text-sm md:text-base">
              <li className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-[#6FCF97] mt-1 flex-shrink-0" />
                <span>Access, update, or delete your personal information</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-[#6FCF97] mt-1 flex-shrink-0" />
                <span>Opt-out of marketing communications</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-[#6FCF97] mt-1 flex-shrink-0" />
                <span>Request a copy of your data in a portable format</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-[#6FCF97] mt-1 flex-shrink-0" />
                <span>Withdraw consent at any time where we rely on your consent</span>
              </li>
            </ul>
            <p className="mt-4 text-[#9B948A] text-sm md:text-base">
              To exercise these rights, please contact us using the information provided below.
            </p>
          </section>

          {/* Data Retention */}
          <section className="bg-[#131110]/80 backdrop-blur-sm rounded-2xl border border-[#C9A24B]/20 p-6 md:p-8">
            <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Data Retention
            </h2>
            <p className="text-[#9B948A] leading-relaxed text-sm md:text-base">
              We retain your personal information only for as long as necessary to fulfill the purposes outlined in 
              this policy, unless a longer retention period is required by law. We will securely delete or anonymize 
              your information when it is no longer needed.
            </p>
          </section>

          {/* Children's Privacy */}
          <section className="bg-[#131110]/80 backdrop-blur-sm rounded-2xl border border-[#C9A24B]/20 p-6 md:p-8">
            <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Children's Privacy
            </h2>
            <p className="text-[#9B948A] leading-relaxed text-sm md:text-base">
              Our services are not intended for individuals under the age of 18. We do not knowingly collect personal 
              information from children. If you are a parent or guardian and believe your child has provided us with 
              personal information, please contact us immediately.
            </p>
          </section>

          {/* Changes */}
          <section className="bg-[#131110]/80 backdrop-blur-sm rounded-2xl border border-[#C9A24B]/20 p-6 md:p-8">
            <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Changes to This Policy
            </h2>
            <p className="text-[#9B948A] leading-relaxed text-sm md:text-base">
              We may update this Privacy Policy from time to time to reflect changes in our practices or legal 
              requirements. We will notify you of any significant changes by posting the new policy on this page 
              and updating the "Last Updated" date. We encourage you to review this policy periodically.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-[#131110]/80 backdrop-blur-sm rounded-2xl border border-[#C9A24B]/20 p-6 md:p-8">
            <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Contact Us
            </h2>
            <p className="text-[#9B948A] leading-relaxed text-sm md:text-base">
              If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us at:
            </p>
            <div className="mt-4 p-4 rounded-lg border border-[#C9A24B]/20 bg-[#0A0908]/50">
              <p className="text-[#F5EFE0] font-mono text-sm">📧 privacy@waveverify.com</p>
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

export default Privacy;
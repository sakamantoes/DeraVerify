// src/components/Contact.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Send, Phone, MessageCircle, Clock, CheckCircle, XCircle, Copy, Check, AtSign, User, Eye, EyeOff, ClipboardCheck, MailCheck, Lock } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(null);
  const [showEmails, setShowEmails] = useState({});
  
  // Available WhatsApp Numbers
  const whatsappNumbers = [
    { number: "+1 (212) 555-1234", country: "USA", flag: "🇺🇸", available: true, operator: "Verizon" },
    { number: "+44 20 7946 0123", country: "UK", flag: "🇬🇧", available: true, operator: "Vodafone" },
    { number: "+61 2 3456 7890", country: "Australia", flag: "🇦🇺", available: true, operator: "Telstra" },
    { number: "+81 3 1234 5678", country: "Japan", flag: "🇯🇵", available: true, operator: "NTT" },
    { number: "+49 30 1234567", country: "Germany", flag: "🇩🇪", available: true, operator: "Deutsche Telekom" },
    { number: "+33 1 2345 6789", country: "France", flag: "🇫🇷", available: false, operator: "Orange" },
    { number: "+86 10 1234 5678", country: "China", flag: "🇨🇳", available: true, operator: "China Mobile" },
    { number: "+91 98765 43210", country: "India", flag: "🇮🇳", available: true, operator: "Jio" },
  ];

  // Email Logs with masked emails
  const [emailLogs, setEmailLogs] = useState([
    { 
      id: 1, 
      email: "john.doe@gmail.com", 
      maskedEmail: "jo*****oe@gmail.com",
      message: "Your OTP code is: 482901 - Email verification successful", 
      status: "delivered", 
      timestamp: "Just now", 
      type: "OTP Verification" 
    },
    { 
      id: 2, 
      email: "sarah.smith@yahoo.com", 
      maskedEmail: "sa*****th@yahoo.com",
      message: "Verification code: 735294 - Google Voice setup complete", 
      status: "delivered", 
      timestamp: "2 min ago", 
      type: "Account Setup" 
    },
    { 
      id: 3, 
      email: "michael.brown@hotmail.com", 
      maskedEmail: "mi*****wn@hotmail.com",
      message: "Welcome to Smswinners! Your account is ready. Click to verify", 
      status: "sent", 
      timestamp: "5 min ago", 
      type: "Welcome Email" 
    },
    { 
      id: 4, 
      email: "emily.wilson@gmail.com", 
      maskedEmail: "em*****on@gmail.com",
      message: "Your Google Voice code: 961847 - Number +1 (555) 123-4567 activated", 
      status: "delivered", 
      timestamp: "12 min ago", 
      type: "Google Voice" 
    },
    { 
      id: 5, 
      email: "david.miller@outlook.com", 
      maskedEmail: "da*****er@outlook.com",
      message: "Instagram verification: 284673 - Link your number to continue", 
      status: "pending", 
      timestamp: "15 min ago", 
      type: "Social Media" 
    },
    { 
      id: 6, 
      email: "lisa.anderson@gmail.com", 
      maskedEmail: "li*****on@gmail.com",
      message: "WhatsApp code: 539182 - Your virtual number is ready", 
      status: "delivered", 
      timestamp: "20 min ago", 
      type: "WhatsApp Setup" 
    },
    { 
      id: 7, 
      email: "robert.taylor@icloud.com", 
      maskedEmail: "ro*****or@icloud.com",
      message: "Telegram verification: 728493 - Secure your account", 
      status: "delivered", 
      timestamp: "25 min ago", 
      type: "Telegram" 
    },
    { 
      id: 8, 
      email: "amanda.martinez@gmail.com", 
      maskedEmail: "am*****ez@gmail.com",
      message: "Signal code: 847261 - End-to-end encryption enabled", 
      status: "sent", 
      timestamp: "30 min ago", 
      type: "Signal Setup" 
    },
  ]);

  // Simulate real-time email updates
  useEffect(() => {
    const interval = setInterval(() => {
      const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'];
      const names = ['james', 'maria', 'alex', 'sophia', 'daniel', 'olivia', 'william', 'emma'];
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomDomain = domains[Math.floor(Math.random() * domains.length)];
      const randomNumber = Math.floor(100000 + Math.random() * 900000);
      const fullEmail = `${randomName}.${Math.floor(Math.random() * 1000)}@${randomDomain}`;
      const maskedEmail = fullEmail.replace(/(.{2})(.*)(@.*)/, (match, p1, p2, p3) => {
        return p1 + '*'.repeat(Math.min(p2.length, 4)) + p3;
      });
      
      const newLog = {
        id: Date.now(),
        email: fullEmail,
        maskedEmail: maskedEmail,
        message: `OTP verification code: ${randomNumber} - Email verification for ${randomDomain.split('.')[0]} service`,
        status: "delivered",
        timestamp: "Just now",
        type: "Email Verification"
      };
      setEmailLogs(prev => [newLog, ...prev.slice(0, 14)]);
    }, 20000); // Add new email every 20 seconds

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ name: '', email: '', message: '' });
  };

  const copyToClipboard = (number) => {
    navigator.clipboard.writeText(number);
    setCopiedNumber(number);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  const toggleShowEmail = (id) => {
    setShowEmails(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'delivered': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'sent': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <XCircle className="w-4 h-4 text-red-light" />;
    }
  };

  return (
    <section className="py-24 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Get In <span className="text-red-light">Touch</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Have questions? We're here to help you 24/7
          </p>
        </motion.div>
        
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl p-8"
          >
            <h3 className="text-2xl font-bold mb-6">Send us a message</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-red-light/20 rounded-lg focus:outline-none focus:border-red-light text-white"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-red-light/20 rounded-lg focus:outline-none focus:border-red-light text-white"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Message</label>
                <textarea
                  rows={5}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-red-light/20 rounded-lg focus:outline-none focus:border-red-light text-white"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-red-light to-red-dark rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                Send Message <Send size={18} />
              </motion.button>
              {submitted && (
                <p className="text-green-500 text-center">Message sent successfully!</p>
              )}
            </form>
          </motion.div>

          {/* Email Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl p-8 flex flex-col justify-center items-center text-center"
          >
            <div className="w-20 h-20 bg-red-light/10 rounded-full flex items-center justify-center mb-6">
              <Mail className="w-10 h-10 text-red-light" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Email Us Directly</h3>
            <p className="text-gray-300 mb-2">Our support team responds within 24 hours</p>
            <a href="mailto:wowwin96@gmail.com" className="text-2xl font-bold text-red-light hover:text-red-400 transition-colors">
              wowwin96@gmail.com
            </a>
            <div className="mt-8 p-4 bg-red-light/5 rounded-lg border border-red-light/20">
              <p className="text-sm text-gray-400">📧 Enterprise Email Support Available</p>
              <p className="text-sm text-gray-400">⏱️ 24/7 Email Response Team</p>
              <p className="text-sm text-gray-400">🔒 End-to-end Email Encryption</p>
            </div>
          </motion.div>
        </div>

        {/* WhatsApp Numbers & Email Logs Section */}
        <div className="grid lg:grid-cols-2 gap-8 mt-12">
          {/* Available WhatsApp Numbers */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl p-2"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Available WhatsApp Numbers</h3>
                <p className="text-gray-400 text-sm">Click any number to copy & chat</p>
              </div>
            </div>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {whatsappNumbers.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => copyToClipboard(item.number)}
                  className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${
                    item.available 
                      ? 'bg-green-500/5 hover:bg-green-500/10 border border-green-500/20' 
                      : 'bg-red-light/5 opacity-50 cursor-not-allowed border border-red-light/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.flag}</span>
                    <div>
                      <p className="text-white font-medium">{item.number}</p>
                      <p className="text-xs text-gray-400">{item.country} • {item.operator}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.available ? (
                      <>
                        {copiedNumber === item.number ? (
                          <Check className="w-5 h-5 text-green-500" />
                        ) : (
                          <Copy className="w-5 h-5 text-gray-400 hover:text-green-500 transition-colors" />
                        )}
                        <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">Available</span>
                      </>
                    ) : (
                      <span className="text-xs px-2 py-1 bg-red-light/20 text-red-400 rounded-full">Busy</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-6 p-3 bg-green-500/5 rounded-lg border border-green-500/20 text-center">
              <p className="text-xs flex item-center justify-center gap-1 text-gray-400"><ClipboardCheck size={16} classname='bg-white'/> <span>Click any number to copy to clipboard and start chatting on WhatsApp</span></p>
            </div>
          </motion.div>

          {/* Email Logs Section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl p-2"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center">
                  <AtSign className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Recent Email Logs</h3>
                  <p className="text-gray-400 text-sm">Live email verification & OTP delivery status</p>
                </div>
              </div>
              <span className="text-xs text-green-500 animate-pulse">● Live</span>
            </div>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence>
                {emailLogs.map((log, index) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.03 }}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1">
                        <User className="w-4 h-4 text-gray-400" />
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">
                            {showEmails[log.id] ? log.email : log.maskedEmail}
                          </span>
                          <button
                            onClick={() => toggleShowEmail(log.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            {showEmails[log.id] ? (
                              <EyeOff className="w-3 h-3 text-gray-400 hover:text-white" />
                            ) : (
                              <Eye className="w-3 h-3 text-gray-400 hover:text-white" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(log.status)}
                        <span className="text-xs text-gray-400">{log.timestamp}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 mb-2 pl-6">{log.message}</p>
                    <div className="flex items-center justify-between pl-6">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        log.type.includes('OTP') || log.type.includes('Verification')
                          ? 'bg-purple-500/20 text-purple-400' 
                          : log.type.includes('Welcome')
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {log.type}
                      </span>
                      <span className={`text-xs ${
                        log.status === 'delivered' ? 'text-green-500' :
                        log.status === 'sent' ? 'text-blue-500' :
                        'text-yellow-500'
                      }`}>
                        {log.status.toUpperCase()}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            <div className="mt-6 p-3 bg-purple-500/5 rounded-lg border border-purple-500/20 text-center">
              <p className="text-xs text-gray-400 flex item-center justify-center gap-1"><MailCheck size={16}/> <span>Real-time email updates - New emails appear automatically every 20 seconds</span> </p>
              <p className="text-xs text-gray-500 mt-1 flex item-center justify-center gap-1"><Lock size={16} /> <span>Emails are masked for privacy</span> Click to view full email</p>
            </div>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(220, 38, 38, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(220, 38, 38, 0.8);
        }
      `}</style>
    </section>
  );
};

export default Contact;
// src/components/FloatingChat.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaWhatsapp, FaTelegramPlane, FaHeadset } from "react-icons/fa";

const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  // WhatsApp Configuration
  const whatsappNumber = "09074705972";
  const whatsappMessage = "Hello! I'm interested in Smswinners services.";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
  const whatsappGroupUrl = "https://chat.whatsapp.com/BPXIzzwuftU4f3ZTCPRhuj";

  // Telegram Configuration
  const telegramUsername = "SmswinnersSupport"; // Your Telegram username
  const telegramNumber = "09013712464";
  const telegramUrl = `https://t.me/${telegramUsername}`;
  // Alternative: Direct phone number link
  const telegramPhoneUrl = `https://t.me/+${telegramNumber}`;

  const handleWhatsApp = () => {
    window.open(whatsappGroupUrl, "_blank");
    setIsOpen(false);
    setShowOptions(false);
  };

  const handleTelegram = () => {
    window.open(telegramUrl, "_blank");
    setIsOpen(false);
    setShowOptions(false);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="fixed bottom-6 right-6 z-50 md:bottom-8 md:right-8"
      >
        {/* Pulsing Ring Effect */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.2, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 rounded-full bg-gradient-to-r from-red-light to-orange-500 blur-xl"
        />

        {/* Main Button */}
        <motion.button
          onClick={() => {
            setIsOpen(true);
            setShowOptions(true);
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="
            relative
            flex
            items-center
            justify-center
            w-16
            h-16
            rounded-full
            bg-gradient-to-br
            from-red-light
            to-orange-500
            shadow-2xl
            shadow-red-light/40
            border
            border-white/20
            backdrop-blur-md
            group
          "
        >
          <FaHeadset className="text-white text-3xl" />
          
          {/* Customer Support Badge */}
          <div className="absolute -top-2 -right-2 bg-white rounded-full px-2 py-0.5 shadow-lg">
            <span className="text-xs font-bold text-red-light">CS</span>
          </div>
        </motion.button>
      </motion.div>

      {/* Chat Options Popup */}
      <AnimatePresence>
        {isOpen && showOptions && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsOpen(false);
                setShowOptions(false);
              }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Options Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 40 }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 220,
              }}
              className="
                fixed
                bottom-28
                right-6
                z-50
                w-[90vw]
                max-w-md
                sm:h-[490px]
                h-auto
                rounded-3xl
                overflow-hidden
                border
                border-red-light/20
                bg-gradient-to-br
                from-gray-900
                to-black
                shadow-2xl
              "
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-red-light to-orange-500 p-5 flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg">
                    <FaHeadset className="text-red-light text-3xl" />
                  </div>
                  <span className="absolute bottom-1 right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
                </div>

                <div>
                  <h3 className="text-white font-bold text-lg">
                    Customer Support
                  </h3>
                  <p className="text-orange-100 text-sm">
                    Choose your preferred platform
                  </p>
                </div>

                <button
                  onClick={() => {
                    setIsOpen(false);
                    setShowOptions(false);
                  }}
                  className="ml-auto text-white/70 hover:text-white text-xl transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-300 text-center leading-relaxed mb-2">
                  👋 Welcome to Smswinners Support!
                  <br />
                  How would you like to connect with us?
                </p>

                {/* Options Cards */}
                <div className="space-y-4">
                  {/* WhatsApp Option */}
                  <motion.button
                    onClick={handleWhatsApp}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="
                      w-full
                      p-4
                      rounded-xl
                      flex
                      items-center
                      gap-4
                      bg-gradient-to-r
                      from-green-500/10
                      to-green-600/10
                      border
                      border-green-500/30
                      hover:border-green-500
                      transition-all
                      group
                    "
                  >
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FaWhatsapp className="text-green-500 text-2xl" />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="text-white font-semibold">WhatsApp Group</h4>
                      <p className="text-gray-400 text-sm">Join our community & get support</p>
                    </div>
                    <span className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      →
                    </span>
                  </motion.button>

                  {/* Telegram Option */}
                  <motion.button
                    onClick={handleTelegram}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="
                      w-full
                      p-4
                      rounded-xl
                      flex
                      items-center
                      gap-4
                      bg-gradient-to-r
                      from-blue-500/10
                      to-cyan-500/10
                      border
                      border-blue-500/30
                      hover:border-blue-500
                      transition-all
                      group
                    "
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FaTelegramPlane className="text-blue-500 text-2xl" />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="text-white font-semibold">Telegram</h4>
                      <p className="text-gray-400 text-sm">Instant messaging & updates</p>
                    </div>
                    <span className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      →
                    </span>
                  </motion.button>
                </div>

                {/* Features */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="text-green-500">✓</span>
                      24/7 Availability
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="text-green-500">✓</span>
                      Instant Responses
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="text-green-500">✓</span>
                      Secure Chat
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="text-green-500">✓</span>
                      Free Support
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-500 text-center mt-5">
                  Your privacy is important. All chats are encrypted and secure.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Direct Chat Popup (Alternative - shows after selecting option) */}
      <AnimatePresence>
        {isOpen && !showOptions && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsOpen(false);
                setShowOptions(false);
              }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 40 }}
              className="fixed bottom-28 right-6 z-50 w-[90vw] max-w-md rounded-3xl overflow-hidden border border-red-light/20 bg-gradient-to-br from-gray-900 to-black shadow-2xl"
            >
              <div className="bg-gradient-to-r from-red-light to-orange-500 p-5 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                  <FaHeadset className="text-red-light text-2xl" />
                </div>
                <div>
                  <h3 className="text-white font-bold">Connecting...</h3>
                  <p className="text-orange-100 text-sm">Please wait a moment</p>
                </div>
              </div>
              <div className="p-6 text-center">
                <div className="w-12 h-12 border-4 border-red-light/30 border-t-red-light rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-300">Redirecting to chat...</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingChat;
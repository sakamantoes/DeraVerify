// src/components/Navbar.jsx - With Login and Signup Buttons (No Forms)
import React, { useState, useEffect } from "react";
import {
  Menu,
  X,
  Phone,
  Mail,
  ChevronRight,
  HomeIcon,
  FileText,
  Briefcase,
  PhoneCall,
  LogIn,
  UserPlus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import imageObject from "../utils/image";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const navLinks = [
    { name: "Home", href: "#home", icon: HomeIcon },
    { name: "About", href: "#about", icon: FileText },
    { name: "Services", href: "#services", icon: Briefcase },
    { name: "Contact", href: "#contact", icon: PhoneCall },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-black/90 backdrop-blur-xl border-b border-red-light/20 shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo with Red 3D Animated Globe */}
            <motion.a
              href="#home"
              whileHover={{ scale: 1.05 }}
              className="flex-shrink-0 cursor-pointer flex items-center gap-2 group"
            >
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="w-8 h-8"
                >
                   <img src={imageObject.Logo} alt="Logo" className="w-8 h-8 rounded-full" />
                </motion.div>

                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.6, 0, 0.6],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 rounded-full border-2 border-red-light/50"
                  style={{ width: "100%", height: "100%" }}
                />
              </div>

              <h1 className="text-2xl font-bold bg-gradient-to-r from-red-light to-red-dark bg-clip-text text-transparent">
                Smswinners
              </h1>
            </motion.a>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
                >
                  {link.name}
                </motion.a>
              ))}

              {/* Auth Buttons for Desktop */}
              <div className="flex items-center gap-3 ml-4">
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-5 py-2 text-gray-300 hover:text-white border border-red-light transition-colors flex items-center gap-2 rounded-lg"
                  >
                    <LogIn size={18} />
                    Login
                  </motion.button>
                </Link>

                <Link to="/signup">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-5 py-2 bg-gradient-to-r from-red-light to-red-dark rounded-lg text-white font-semibold shadow-lg shadow-red-light/30 flex items-center gap-2"
                  >
                  <UserPlus size={18} />
                  Sign Up
                </motion.button>
                </Link>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-white focus:outline-none relative z-50"
              whileTap={{ scale: 0.9 }}
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Full Screen Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            />

            <div className="relative h-full flex flex-col justify-center items-center px-6 overflow-y-auto">
              {/* Logo in menu */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-8 text-center"
              >
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="relative">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-12 h-12"
                    >
                     <img src={imageObject.Logo} alt="Logo" className="rounded-full " />
                    </motion.div>
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-red-light to-red-dark bg-clip-text text-transparent">
                    Smswinners
                  </h2>
                </div>
                <p className="text-gray-400 text-sm">
                  Premium Virtual Numbers Platform
                </p>
              </motion.div>

              {/* Navigation Links */}
              <div className="w-full max-w-sm space-y-1">
                {navLinks.map((link, index) => (
                  <motion.a
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.1 }}
                    whileHover={{ x: 10 }}
                    className="flex items-center justify-between px-6 py-4 text-white text-xl font-medium border-b border-white/10 hover:border-red-light/50 transition-all group"
                  >
                    <span className="flex items-center gap-3">
                      <link.icon className="text-red-light" size={24} />
                      <span>{link.name}</span>
                    </span>
                    <ChevronRight
                      className="opacity-0 group-hover:opacity-100 transition-all text-red-light"
                      size={20}
                    />
                  </motion.a>
                ))}
              </div>

              {/* Mobile Auth Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="w-full max-w-sm mt-8 space-y-3"
              >
                <Link to="/login">  <button
                  onClick={() => {
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-red-light/30 mb-2 rounded-xl text-white font-semibold hover:bg-red-light/10 transition-all"
                >
                  <LogIn size={20} />
                  Login
                </button></Link>
               
                <Link to="/signup">
                  <button
                    onClick={() => {
                      handleSignupClick();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-light to-red-dark rounded-xl text-white font-semibold shadow-lg shadow-red-light/30"
                  >
                    <UserPlus size={20} />
                    Sign Up Free
                  </button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;

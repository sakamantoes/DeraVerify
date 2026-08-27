// src/components/Footer.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Mail, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  return (
    <footer className="bg-gradient-to-t from-black to-red-950/10 border-t border-red-light/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-red-light to-red-dark bg-clip-text text-transparent mb-4">
              Smswinners
            </h2>
            <p className="text-gray-400 text-sm">
              Premium virtual numbers & SMS verification platform for global users.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-red-light transition">Home</a></li>
              <li><a href="#" className="hover:text-red-light transition">About</a></li>
              <li><a href="#" className="hover:text-red-light transition">Services</a></li>
              <li><a href="#" className="hover:text-red-light transition">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-4">Legal</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/terms" className="hover:text-red-light transition">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="hover:text-red-light transition">Privacy Policy</Link></li>
            </ul>
          </div>
          
          
        </div>
        
        <div className="border-t border-red-light/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2026 Smswinners. All rights reserved.
          </p>
          <motion.button
            whileHover={{ y: -3 }}
            onClick={scrollToTop}
            className="mt-4 md:mt-0 p-2 bg-red-light/10 rounded-full hover:bg-red-light/20 transition"
          >
            <ChevronUp size={20} className="text-red-light" />
          </motion.button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
"use client";

import Image from "next/image";
import React from "react";
import { FaGraduationCap, FaArrowRight } from "react-icons/fa";
import { motion } from "framer-motion";
import { SCHOOL_NAME } from '../data/data';

const Hero = () => {
  return (
    <section className="relative bg-white overflow-hidden py-10 md:py-32 lg:py-40">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0 hidden md:block">
        <Image
          src="/assets/background.png"
          alt="School Campus Background"
          layout="fill"
          objectFit="cover"
          objectPosition="center"
          priority
        />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center lg:text-left">
        <motion.div
          className="max-w-3xl mx-auto lg:mx-0"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h1
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight drop-shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
          >
            Nurturing Minds,
            <br className="block md:hidden" /> Building Futures at
            <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-800">
              {SCHOOL_NAME}
            </span>
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl text-gray-700 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.7, ease: "easeOut" }}
          >
            Discover an inspiring environment where academic excellence meets holistic development.
            Join our nurturing community dedicated to student growth and success.
          </motion.p>

          <motion.div
            className="flex flex-row items-center justify-center lg:justify-start gap-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
          >
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(59, 130, 246, 0.4)" }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold py-2 sm:py-3.5 px-4 sm:px-8 rounded-full shadow-lg transition-all duration-300 ease-in-out transform focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              Learn More <FaArrowRight className="ml-1" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "#e0f2fe", color: "#2563eb" }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 border-2 border-blue-500 text-blue-600 bg-white font-semibold py-2 sm:py-3.5 px-4 sm:px-8 rounded-full shadow-md hover:border-blue-600 hover:text-blue-700 transition-all duration-300 ease-in-out transform focus:outline-none focus:ring-4 focus:ring-blue-200"
            >
              <FaGraduationCap className="mr-1" /> Admissions
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;

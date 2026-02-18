"use client";

import React from "react";
import { motion } from "framer-motion";
import { FaUsers } from "react-icons/fa";
import { SCHOOL_NAME } from "../data/data";

const About = () => {
  return (
    <section id="about" className="py-10 sm:py-20 px-4 bg-white text-gray-800 relative">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="w-full md:w-1/2 mb-10 md:mb-0 md:pr-10"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center sm:text-left">
              About{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-800">
                {SCHOOL_NAME}
              </span>
            </h2>
            <p className="text-base md:text-lg mb-4 text-gray-600 leading-relaxed">
              At {SCHOOL_NAME}, we believe education goes beyond textbooks. We foster curiosity, creativity, and character in a nurturing environment where students thrive academically and personally.
            </p>
            <p className="text-base md:text-lg mb-4 text-gray-600 leading-relaxed">
              Our holistic curriculum blends academics with co-curricular activities, modern learning technologies, and life skills training to prepare students for the future.
            </p>
            <p className="text-base md:text-lg text-gray-600 leading-relaxed">
              Backed by passionate educators and a caring support team, we aim to empower every learner to become a confident, compassionate, and responsible global citizen.
            </p>
            <button className="mt-8 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 hover:scale-105 shadow-lg shadow-blue-400/30">
              <FaUsers />
              Meet Our Faculty
            </button>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="md:w-1/2 relative"
          >
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl blur opacity-20 z-0 animate-pulse"></div>
            <img
              src="https://theindianpublicschool.org/wp-content/uploads/2025/02/cbse-tips.webp"
              alt="School environment"
              className="relative rounded-xl shadow-2xl w-full h-auto border-2 border-gray-200 z-10"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;

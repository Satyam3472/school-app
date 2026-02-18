import React from "react";
import { FaChevronRight, FaFacebook, FaInstagram, FaMapMarkerAlt, FaTwitter, FaYoutube } from "react-icons/fa";
import { FaSquarePhone } from "react-icons/fa6";
import { IoIosSend } from "react-icons/io";
import { IoMail } from "react-icons/io5";
import { SCHOOL_NAME } from '../data/data';

const Footer = () => {
  return (
    <footer className="bg-gray-50 text-gray-700 py-10 px-6 sm:py-16 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* School Branding */}
          <div>
            <h3 className="text-2xl font-bold mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-sky-700">
                {SCHOOL_NAME.toUpperCase()}
              </span>
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              A nurturing environment fostering academic excellence, creativity, and lifelong learning.
            </p>
            <div className="flex space-x-4 mt-4">
              {[FaFacebook, FaInstagram, FaTwitter, FaYoutube].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="text-gray-500 hover:text-teal-600 transition-colors duration-300"
                >
                  <Icon className="text-xl" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              {[
                { text: "Home", href: "/" },
                { text: "Academics", href: "/academics" },
                { text: "Admissions", href: "/admissions" },
                { text: "Contact Us", href: "/contact" },
              ].map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="flex items-center text-gray-600 hover:text-teal-600 transition-colors"
                  >
                    <FaChevronRight className="text-xs mr-2 text-teal-600" />
                    {link.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-4 text-sm">
              {[
                { icon: <FaMapMarkerAlt />, text: "Near Barhat Block, Laxmipur Jamui (BIHAR) 811313" },
                { icon: <FaSquarePhone />, text: "+91 8674814870" },
                { icon: <IoMail />, text: "info@kidslifeschool.edu" },
              ].map((item, index) => (
                <li key={index} className="flex items-start text-gray-600">
                  <div className="mt-1 text-teal-600">{item.icon}</div>
                  <span className="ml-3 leading-relaxed">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Newsletter</h4>
            <p className="text-sm text-gray-600 mb-4">
              Stay informed with school news and announcements.
            </p>
            <div className="flex mb-4">
              <input
                type="email"
                placeholder="Your Email"
                className="bg-white border border-gray-300 text-sm px-4 py-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-teal-500 w-full"
              />
              <button className="bg-teal-600 hover:bg-teal-700 text-white px-3 rounded-r-md transition-all duration-300">
                <IoIosSend className="w-6 h-6" />
              </button>
            </div>
            <button className="w-full bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white font-medium py-2 rounded-md shadow hover:shadow-lg transition-transform transform hover:scale-[1.02]">
              Request Prospectus
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 mt-12 pt-8 text-center text-sm text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} {SCHOOL_NAME}. All rights reserved.
          </p>
          <div className="flex justify-center space-x-6 mt-4">
            {[
              { text: "Privacy Policy", link: "#" },
              { text: "Terms of Use", link: "#" },
              { text: "Site Map", link: "#" },
            ].map((item, index) => (
              <a
                key={index}
                href={item.link}
                className="hover:text-teal-600 transition-colors"
              >
                {item.text}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
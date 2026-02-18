"use client";
import React from "react";
import { motion } from "framer-motion";

const imageGroups = [
  [
    "https://images.pexels.com/photos/1001914/pexels-photo-1001914.jpeg", // Classroom
    "https://media.istockphoto.com/id/1163985429/photo/group-of-schoolboys-and-schoolgirls-at-school-campus.jpg?s=612x612&w=0&k=20&c=gF0_Qpp1uZ6VAyOi90xprZISgaiLxnpssWky0zJ6gRY=", // Books and students
    "https://images.pexels.com/photos/3992949/pexels-photo-3992949.jpeg", // Teacher and blackboard
  ],
  [
    "https://images.pexels.com/photos/256395/pexels-photo-256395.jpeg", // Sports activity
    "https://images.pexels.com/photos/5088014/pexels-photo-5088014.jpeg", // Art class
    "https://images.pexels.com/photos/5212323/pexels-photo-5212323.jpeg", // Happy students
  ],
  [
    "https://images.pexels.com/photos/5212337/pexels-photo-5212337.jpeg", // Group learning
    "https://images.pexels.com/photos/5212325/pexels-photo-5212325.jpeg", // Children with school bags
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRK-Pr9VVqhVhbauyXcL_qXtFJrU0Zn2a9JTw&s", // Assembly or outdoor
  ],
  [
    "https://images.pexels.com/photos/3771661/pexels-photo-3771661.jpeg", // Lab
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR45rR2TElFY_XQDEeiDVEuMgtHc8mQK_3KHA&s", // Drawing activity
    "https://images.pexels.com/photos/1181398/pexels-photo-1181398.jpeg", // Group of kids learning
  ],
];

const Gallery = () => {
  return (
    <section className="px-4 py-8 sm:py-24 sm:px-16 bg-white" id="gallery">
      <motion.h2
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-3xl sm:text-4xl font-extrabold text-center mb-10 sm:mb-16 text-gray-900 tracking-tight"
      >
        School{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-800">
          Gallery
        </span>
      </motion.h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-6">
        {imageGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="flex flex-col gap-2 sm:gap-6">
            {group.map((src, imgIndex) => (
              <motion.img
                key={imgIndex}
                src={src}
                alt={`Gallery image ${groupIndex * 3 + imgIndex + 1}`}
                loading="lazy"
                className="w-full h-auto rounded-lg border border-gray-200 shadow-md hover:shadow-lg transition-transform hover:scale-[1.03] duration-300"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: imgIndex * 0.15 }}
              />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Gallery;

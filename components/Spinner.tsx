"use client";

import React from "react";
import { motion } from "framer-motion";

interface SpinnerProps {
  color?: string;
  size?: number;
}

const Spinner: React.FC<SpinnerProps> = ({ color = "bg-black/60", size = 40 }) => {
  const dots = Array.from({ length: 10 });

  return (
    <div
      className="relative"
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      {dots.map((_, i) => {
        const rotation = i * 36; // 360° / 10 dots
        const delay = i * 0.1;

        return (
          <motion.div
            key={i}
            className={`absolute top-0 left-1/2 w-[3px] h-[14px] ${color} rounded-full origin-bottom`}
            style={{
              rotate: `${rotation}deg`,
            }}
            animate={{
              y: [0, -size * 0.3, 0],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut",
              delay,
            }}
          />
        );
      })}
    </div>
  );
};

export default Spinner;

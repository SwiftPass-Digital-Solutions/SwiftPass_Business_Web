"use client";
import React, { useMemo, useState } from "react";
import styles from "./styles.module.css";
import { AnimatePresence, motion } from "framer-motion";

const Tooltip: React.FC<{
  children: React.ReactNode;
  text: string;
  showTooltip?: boolean;
  position?: "top" | "bottom" | "left" | "right";
  positionClassName?: string;
}> = ({
  children,
  text,
  showTooltip = true,
  position = "top",
  positionClassName = "",
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const shouldShow = useMemo(
    () => showTooltip === true && isHovered,
    [isHovered, showTooltip]
  );
  // Positioning styles
  const positionClasses: Record<string, string> = {
    top: "-top-12 left-1 -translate-x-1/2",
    bottom: "top-8 left-1 -translate-x-1/2",
    left: "top-1 -translate-y-1/2 -left-28",
    right: "top-1 -translate-y-1/2 left-12",
  };

  const arrowClasses: Record<string, string> = {
    top: "top-full right-1/2 translate-x-1/2 border-t-[#121212]",
    bottom: "bottom-full right-1/2 translate-x-1/2 border-b-[#121212]",
    left: "top-1/2 left-full -translate-y-1/2 border-l-[#121212]",
    right: "top-1/2 right-full -translate-y-1/2 border-r-[#121212]",
  };

  // Animation direction
  const motionVariants = {
    top: { opacity: 0, y: -10, x: 0 },
    bottom: { opacity: 0, y: 10, x: 0 },
    left: { opacity: 0, x: -10, y: 0 },
    right: { opacity: 0, x: 10, y: 0 },
  };

  return (
    <div
      className={`${styles["container"]} relative inline-flex items-center justify-center`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="w-full h-full relative">{children}</div>
      <AnimatePresence>
        {shouldShow && (
          <motion.div
            // initial={{ opacity: 0, x: -5 }}
            // animate={{ opacity: 1, x: 0 }}
            // exit={{ opacity: 0, x: -5 }}
            // transition={{ duration: 0.2 }}
            // // -top-10 left-1/2 -translate-x-1/2
            // className="absolute left-0 top-1 bg-white text-xs px-4 py-2 rounded-md shadow-lg"
            initial={motionVariants[position]}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={motionVariants[position]}
            transition={{ duration: 0.2 }}
            className={`absolute z-[9999] ${positionClasses[position]} ${positionClassName}`}
          >
            <div className="relative">
              <div
                className={`absolute w-0 h-0 border-4 border-transparent ${arrowClasses[position]}`}
              />
              <div className="whitespace-nowrap bg-[#121212] text-white text-xs px-4 py-2 rounded-md shadow-lg">
                {text}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { Tooltip };

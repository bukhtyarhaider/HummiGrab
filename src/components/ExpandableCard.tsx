import React, { ReactElement, ReactNode } from "react";
import { motion } from "framer-motion";
import {
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
} from "@heroicons/react/24/outline";

interface ActionBarConfig {
  content: ReactNode;
  position?: "left" | "right" | "center";
}

interface ExpandableCardProps {
  icon?: ReactElement;
  title: string;
  children: ReactNode;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  actionBar?: ActionBarConfig;
}

export const ExpandableCard: React.FC<ExpandableCardProps> = ({
  icon,
  title,
  children,
  isExpanded = false,
  actionBar,
  onToggleExpand,
}) => {
  const actionBarPosition = actionBar?.position || "right";

  const getJustifyClass = () => {
    switch (actionBarPosition) {
      case "left":
        return "justify-start ml-4";
      case "center":
        return "justify-center";
      case "right":
        return "justify-end mr-4";
      default:
        return "justify-end";
    }
  };

  return (
    <motion.div
      initial={{ scale: 0, opacity: 1 }}
      animate={{
        scale: isExpanded ? 0.98 : 1,
        opacity: 1,
        x: 0,
        y: 0,
      }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className={`mt-4 bg-gray-800 rounded-lg shadow-md transition-all duration-500 ease-in-out ${
        isExpanded
          ? "fixed inset-4 z-50 md:m-6 p-1 md:p-6 overflow-hidden flex flex-col"
          : "relative p-4"
      }`}
    >
      <div
        className={`flex justify-between items-center transition-all duration-500 ease-in-out ${
          isExpanded ? " p-1 md:p-4 bg-gray-800" : ""
        } `}
      >
        <h2
          className={`text-xl font-semibold flex items-center text-white transition-all duration-500 ease-in-out  ${
            isExpanded ? "m-0" : "mb-4"
          }`}
        >
          {icon && icon}
          {title}
        </h2>
        <div
          className={`flex flex-1 items-center transition-all duration-500 ease-in-out ${getJustifyClass()}`}
        >
          {actionBar && actionBar.content}
        </div>
        {onToggleExpand && (
          <button
            onClick={onToggleExpand}
            className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            title={isExpanded ? "Minimize" : "Maximize"}
            aria-label={isExpanded ? "Minimize card" : "Maximize card"}
          >
            {isExpanded ? (
              <ArrowsPointingInIcon className="h-5 w-5" />
            ) : (
              <ArrowsPointingOutIcon className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
      <div
        className={`flex-1 overflow-auto transition-all duration-500 ease-in-out ${
          isExpanded ? " p-1 md:p-4" : ""
        }`}
      >
        {children}
      </div>
    </motion.div>
  );
};

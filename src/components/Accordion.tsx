import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AccordionProps {
  title: string;
  content: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

const Accordion: React.FC<AccordionProps> = ({
  title,
  content,
  isOpen,
  onToggle,
  disabled = false,
}) => {
  return (
    <div className="bg-gray-700 rounded-lg flex flex-col h-full">
      <button
        disabled={disabled}
        onClick={onToggle}
        className="w-full p-4 text-left text-lg font-semibold flex justify-between items-center text-white hover:bg-gray-600 transition-colors rounded-t-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-expanded={isOpen}
        aria-controls={`${title.toLowerCase().replace(" ", "-")}-content`}
      >
        {title}
        {!disabled && (
          <span
            className={`text-gray-400 transition-transform duration-300 ease-in-out ${
              isOpen ? "rotate-180" : ""
            }`}
          >
            ▼
          </span>
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={`${title.toLowerCase().replace(" ", "-")}-content`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex-1 overflow-auto"
          >
            <div className="p-4 pt-1 text-gray-200">{content}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Accordion;

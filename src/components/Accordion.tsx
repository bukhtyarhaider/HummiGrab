import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AccordionProps {
  title: string;
  content: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  disabled: boolean;
}

const Accordion: React.FC<AccordionProps> = ({
  title,
  content,
  isOpen,
  onToggle,
  disabled,
}) => {
  return (
    <div className="bg-gray-700 rounded-lg flex flex-col h-full overflow-auto">
      <button
        disabled={disabled}
        onClick={onToggle}
        className="w-full p-4 text-left text-lg font-semibold flex justify-between items-center text-white hover:bg-gray-600 transition-colors rounded-t-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-expanded={isOpen}
        aria-controls={`${title.toLowerCase().replace(" ", "-")}-content`}
      >
        {title}
        <span
          className={`text-gray-400 transition-transform duration-300 ease-in-out ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={`${title.toLowerCase().replace(" ", "-")}-content`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden flex-1"
          >
            <div className="p-4 pt-0 text-gray-200 overflow-auto">
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Accordion;

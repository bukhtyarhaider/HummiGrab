import React, { useState, useEffect, useCallback, ReactElement } from "react";
import { formatTimeFromSeconds } from "../utils";

// Define prop types with variant
interface ActionButtonProps {
  handleAction: (
    event: React.MouseEvent<HTMLButtonElement>
  ) => Promise<void> | void;
  actionName: string;
  variant?: "primary" | "secondary" | "success" | "danger"; // Added variant prop
  disabled?: boolean;
  isLoading?: boolean;
  icon?: ReactElement;
}

// Utility function to generate button classes based on variant and state
const getButtonClasses = (
  variant: "primary" | "secondary" | "success" | "danger",
  isLoading: boolean,
  disabled: boolean
): string => {
  // Base classes shared across all variants
  const baseClasses = `
    flex items-center justify-center px-4 py-2 gap-2 flex-1 sm:w-auto
    text-white font-medium rounded-lg
    transition-all duration-300 ease-in-out
    focus:outline-none focus:ring-4 focus:ring-opacity-50 cursor-pointer disabled:cursor-not-allowed
  `;

  // Variant-specific classes
  const variantClasses = {
    primary: `
      bg-blue-600 hover:bg-blue-700 focus:ring-blue-500
      ${disabled || isLoading ? "bg-gray-500 cursor-not-allowed" : ""}
      ${isLoading ? "cursor-progress" : ""}
    `,
    secondary: `
      bg-purple-600 hover:bg-purple-700 focus:ring-purple-500
      ${disabled || isLoading ? "bg-gray-500 cursor-not-allowed" : ""}
      ${isLoading ? "cursor-progress" : ""}
    `,
    success: `
      bg-green-600 hover:bg-green-700 focus:ring-green-500
      ${disabled || isLoading ? "bg-gray-500 cursor-not-allowed" : ""}
      ${isLoading ? "cursor-progress" : ""}
    `,
    danger: `
      bg-red-600 hover:bg-red-700 focus:ring-red-500
      ${disabled || isLoading ? "bg-red-400 cursor-not-allowed" : ""}
      ${isLoading ? "cursor-progress" : ""}
    `,
  };

  return `${baseClasses} ${variantClasses[variant]}`.trim();
};

// Generic Action Button Component
const ActionButton: React.FC<ActionButtonProps> = ({
  handleAction,
  actionName,
  variant = "primary",
  disabled = false,
  isLoading = false,
  icon,
}) => {
  const [timer, setTimer] = useState<number>(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const updateTimer = useCallback(() => {
    setTimer((prev) => prev + 1);
  }, []);

  // Handle loading state changes
  useEffect(() => {
    if (isLoading) {
      const id: NodeJS.Timeout = setInterval(updateTimer, 1000);
      setIntervalId(id);

      // Cleanup function
      return () => {
        clearInterval(id);
        setTimer(0);
      };
    } else if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  }, [isLoading, updateTimer]);

  // Handle button click with error handling
  const onClickHandler = async (event: React.MouseEvent<HTMLButtonElement>) => {
    try {
      await handleAction(event);
    } catch (error) {
      console.error(`Error in ${actionName} action:`, error);
    }
  };

  return (
    <button
      onClick={onClickHandler}
      disabled={disabled || isLoading}
      aria-label={`${isLoading ? "Processing" : "Start"} ${actionName}`}
      aria-busy={isLoading}
      className={getButtonClasses(variant, isLoading, disabled)}
    >
      <span className="flex items-center gap-2">
        <span className="h-6 w-6 flex-shrink-0">
          {isLoading ? <div className="spinner mr-2" /> : icon && icon}
        </span>

        <span className={isLoading ? "animate-pulse" : ""}>
          {isLoading ? `${actionName} in progress...` : `${actionName}`}
        </span>

        {/* Timer */}
        {isLoading && (
          <span className="ml-2 font-mono" aria-live="polite">
            {formatTimeFromSeconds(timer)}
          </span>
        )}
      </span>
    </button>
  );
};

export default ActionButton;

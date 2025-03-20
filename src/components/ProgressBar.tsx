import React from "react";

interface ProgressBarProps {
  progress: number;
  status: string;
  onDownloadComplete: () => void;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  status,
  onDownloadComplete,
}) => {
  return (
    <div className="mt-8" id="progress-container">
      <div className="w-full mx-auto">
        <progress
          id="progress-bar"
          value={progress}
          max={100}
          className="w-full h-4 bg-gray-700 rounded"
        ></progress>
        <div id="progress-text" className="text-center mt-2 text-gray-300">
          {status === "downloading" ? `${progress}%` : status}
        </div>
      </div>
      {status === "completed" && (
        <div className="text-center mt-4">
          <button
            onClick={onDownloadComplete}
            className="px-6 py-3 bg-green-600 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Download Completed
          </button>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;

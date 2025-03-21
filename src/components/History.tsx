import React from "react";

export interface HistoryProps {
  history: { thumbnail: string; title: string; duration?: number }[];
  onVideoClick: (index: number) => void;
  onRemove: (index: number) => void;
}

const History: React.FC<HistoryProps> = ({
  history,
  onVideoClick,
  onRemove,
}) => {
  return (
    <div className="mt-8 w-full max-w-xl mx-auto">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <svg
          className="w-6 h-6 mr-2 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        Search History
      </h2>
      <div className="grid grid-cols-1 gap-4 overflow-y-auto max-h-[60vh] p-4">
        {history.map((video, index) => (
          <div
            key={index}
            className="flex items-center bg-gray-700 p-3 rounded cursor-pointer hover:scale-105 transform transition duration-300"
            onClick={() => onVideoClick(index)}
          >
            <img
              src={video.thumbnail}
              alt="Thumbnail"
              className="w-16 h-16 rounded mr-4"
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold">
                {video.title.slice(
                  0,
                  video.title.length > 25 ? 25 : video.title.length
                )}
                {video.title.length > 25 ? "..." : ""}
              </h3>
              <p className="text-sm text-gray-300">
                {video.duration
                  ? `Duration: ${formatDuration(video.duration)}`
                  : "Duration: N/A"}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(index);
              }}
              className="ml-2 text-red-400 hover:text-red-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4a1 1 0 011 1v1H9V4a1 1 0 011-1z"
                />
              </svg>
            </button>
          </div>
        ))}

        {history.length === 0 && (
          <div className="text-gray-400 text-center">
            No search history found
          </div>
        )}
      </div>
    </div>
  );
};

const formatDuration = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs ? hrs + "h " : ""}${mins ? mins + "m " : ""}${
    secs ? secs + "s" : ""
  }`;
};

export default History;

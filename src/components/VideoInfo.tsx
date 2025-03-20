import React, { useState } from "react";

export interface VideoInfoProps {
  video?: {
    title: string;
    thumbnail: string;
    duration: number;
    video_formats: { format_id: string; label: string }[];
  };
  onDownload: (formatId: string) => void;
}

const VideoInfo: React.FC<VideoInfoProps> = ({ video, onDownload }) => {
  const [selectedFormat, setSelectedFormat] = useState<string>("");

  const formatDuration = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs ? hrs + "h " : ""}${mins ? mins + "m " : ""}${
      secs ? secs + "s" : ""
    }`;
  };

  if (!video) return null;

  return (
    <div className="mt-8 bg-gray-800 p-6 rounded shadow-md w-full max-w-xl mx-auto">
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
            d="M15 10l4.553-2.553A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 13v-3zM5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          ></path>
        </svg>
        Video Info
      </h2>
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/3 flex-shrink-0">
          <img
            src={video.thumbnail}
            alt="Video Thumbnail"
            className="w-full rounded"
          />
        </div>
        <div className="md:w-2/3 md:pl-4 flex flex-col justify-center">
          <h2 className="text-xl font-semibold mb-2">{video.title}</h2>
          <p>{formatDuration(video.duration)}</p>
          <div className="mb-4">
            <label htmlFor="video-select" className="block font-medium mb-2">
              Select Video Quality:
            </label>
            <select
              id="video-select"
              className="w-full p-2 rounded bg-gray-700 border border-gray-600"
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
            >
              {video.video_formats.map((fmt) => (
                <option key={fmt.format_id} value={fmt.format_id}>
                  {fmt.label}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => onDownload(selectedFormat)}
            className="w-full px-4 py-2 bg-green-600 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Download Merged Video
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoInfo;

import React, { useState } from "react";
import {
  VideoCameraIcon,
  TrashIcon,
  PlayCircleIcon,
  FolderArrowDownIcon,
  StopIcon,
} from "@heroicons/react/24/outline";
import ActionButton from "./ActionButton";

export interface VideoInfoProps {
  video?: {
    title: string;
    thumbnail: string;
    duration: number;
    video_formats: { format_id: string; label: string }[];
    downloadId?: string;
    downloaded: boolean;
    url: string;
  };
  onDownload: (formatId: string) => void;
  onCancel: () => void;
  onDelete?: () => void;
  disabled?: boolean;
  status: "downloading" | "error" | "";
  progress: number;
  downloadId?: string;
}

const VideoInfo: React.FC<VideoInfoProps> = ({
  video,
  onDownload,
  onCancel,
  onDelete,
  disabled,
  status,
  progress,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<string>("");

  const formatDuration = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs ? hrs + "h " : ""}${mins ? mins + "m " : ""}${
      secs ? secs + "s" : ""
    }`.trim();
  };

  const isDownloading = status === "downloading";

  return (
    <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-md w-full">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <VideoCameraIcon className="w-6 h-6 mr-2 text-gray-400" />
        Video Info
      </h2>
      {video ? (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3 flex-shrink-0">
              <img
                src={video.thumbnail}
                alt={`${video.title} thumbnail`}
                className="w-full h-auto rounded-lg object-cover"
              />
            </div>
            <div className="md:w-2/3 flex flex-col justify-center gap-4">
              <h3 className="text-xl font-semibold text-white">
                {video.title}
              </h3>
              <p className="text-gray-300">
                Duration: {formatDuration(video.duration)}
              </p>
              <div>
                <label
                  htmlFor="video-select"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Select Video Quality
                </label>
                <select
                  id="video-select"
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  disabled={disabled || isDownloading}
                  className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed "
                  aria-label="Select video quality"
                >
                  <option value="" disabled>
                    Select a format
                  </option>
                  {video.video_formats.map((fmt) => (
                    <option key={fmt.format_id} value={fmt.format_id}>
                      {fmt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                {video.url && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(video.url, "_blank");
                    }}
                    className="text-red-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-full p-2 transition-colors cursor-pointer"
                    aria-label={`Open ${video.title} on YouTube`}
                  >
                    <PlayCircleIcon className="h-6 w-6" />
                  </button>
                )}

                <ActionButton
                  variant={isDownloading ? "danger" : "success"}
                  handleAction={() =>
                    isDownloading ? onCancel() : onDownload(selectedFormat)
                  }
                  actionName={isDownloading ? "Cancel" : "Download"}
                  disabled={!selectedFormat || disabled}
                  icon={
                    isDownloading ? (
                      <StopIcon className="h-6" />
                    ) : (
                      <FolderArrowDownIcon className="h-6" />
                    )
                  }
                />

                {onDelete && (
                  <button
                    onClick={onDelete}
                    disabled={disabled}
                    className="px-4 py-2 bg-red-600 rounded-lg text-white font-medium transition duration-300 hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50 disabled:bg-gray-500 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
          {status && (
            <div className="flex flex-col gap-4">
              <div className="w-full">
                <div className="text-sm text-gray-300 mb-1">
                  {status === "downloading" ? "Downloading" : "Download Status"}
                  : {progress}%
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${
                      status === "error" ? "bg-red-600" : "bg-blue-600"
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-400 text-center py-4">No video selected</p>
      )}
    </div>
  );
};

export default VideoInfo;

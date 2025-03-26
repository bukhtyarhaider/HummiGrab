import React, { useState } from "react";
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlayCircleIcon,
  DocumentTextIcon,
  ChatBubbleBottomCenterTextIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import { formatTimeFromSeconds } from "../utils";
import { ExpandableCard } from "./ExpandableCard";

export interface HistoryProps {
  history: {
    thumbnail: string;
    title: string;
    duration?: number;
    downloaded: boolean;
    url: string;
    hasSummary?: boolean;
    hasTranscript?: boolean;
    hasAnalysis?: boolean;
  }[];
  onVideoClick: (index: number) => void;
}

const History: React.FC<HistoryProps> = ({ history, onVideoClick }) => {
  const [expandableState, setExpandableState] = useState<boolean>(false);
  return (
    <ExpandableCard
      icon={<ClockIcon className="w-6 h-6 mr-2 text-gray-400" />}
      title={"Search History"}
      onToggleExpand={() => {
        setExpandableState(!expandableState);
      }}
      isExpanded={expandableState}
      actionBar={{
        content: (
          <div className="flex justify-between items-center">
            <div className="w-6 h-6 flex justify-center items-center bg-white font-bold text-black rounded">
              <p>{history?.length ?? 0}</p>
            </div>
          </div>
        ),
        position: "right",
      }}
    >
      <div className="mt-1 w-full">
        <div className="grid grid-cols-1 gap-4 overflow-y-auto max-h-[70vh] p-2">
          {history.length > 0 ? (
            history.map((video, index) => (
              <div
                key={index}
                className="flex items-center bg-gray-700 p-3 rounded-lg cursor-pointer transition-all duration-300 hover:bg-gray-600 hover:scale-[1.02]"
                onClick={() => onVideoClick(index)}
              >
                <img
                  src={video.thumbnail}
                  alt={`${video.title} thumbnail`}
                  className="w-24 h-16 sm:w-32 sm:h-20 object-cover rounded-md mr-4 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white truncate">
                    {video.title}
                  </h3>
                  <p className="text-sm text-gray-300">
                    {video.duration
                      ? `Duration: ${formatTimeFromSeconds(video.duration)}`
                      : "Duration: N/A"}
                  </p>
                  <div className="text-sm text-gray-300 flex flex-wrap gap-4 mt-1">
                    <p className="flex items-center">
                      {video.downloaded ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
                      ) : (
                        <XCircleIcon className="h-5 w-5 text-gray-400 mr-2" />
                      )}
                      <span className="hidden md:block">Downloaded</span>
                    </p>
                    <p className="flex items-center">
                      {video.hasTranscript ? (
                        <ChatBubbleBottomCenterTextIcon className="h-5 w-5 text-green-400 mr-2" />
                      ) : (
                        <ChatBubbleBottomCenterTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                      )}
                      <span className="hidden md:block">Transcripted</span>
                    </p>
                    <p className="flex items-center">
                      {video.hasSummary ? (
                        <DocumentTextIcon className="h-5 w-5 text-purple-400 mr-2" />
                      ) : (
                        <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                      )}
                      <span className="hidden md:block">Summarized</span>
                    </p>
                    <p className="flex items-center">
                      {video.hasAnalysis ? (
                        <ChatBubbleLeftRightIcon className="h-5 w-5 text-purple-400 mr-2" />
                      ) : (
                        <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-400 mr-2" />
                      )}
                      <span className="hidden md:block">Analyzed</span>
                    </p>
                  </div>
                </div>
                <div className="ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(video.url, "_blank");
                    }}
                    className="text-red-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-full p-1 transition-colors"
                    aria-label={`Open ${video.title} on YouTube`}
                  >
                    <PlayCircleIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-400 text-center py-6">
              No search history found
            </div>
          )}
        </div>
      </div>
    </ExpandableCard>
  );
};

export default History;

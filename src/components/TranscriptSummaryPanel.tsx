import React, { useState } from "react";
import { toast } from "react-toastify";
import Summary from "./Summary";
import { VideoEntry } from "../App";
import { DocumentIcon, SparklesIcon } from "@heroicons/react/24/outline";
import ActionButton from "./ActionButton";
import { ExpandableCard } from "./ExpandableCard";

interface TranscriptSummaryPanelProps {
  video: VideoEntry;
  disabled?: boolean;
  onGenerateTranscript: (videoID: string) => Promise<void>;
  onGenerateSummary: (videoID: string) => Promise<void>;
}

const TranscriptSummaryPanel: React.FC<TranscriptSummaryPanelProps> = ({
  video,
  disabled,
  onGenerateTranscript,
  onGenerateSummary,
}) => {
  const [isGeneratingTranscript, setIsGeneratingTranscript] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const handleTranscript = async () => {
    setIsGeneratingTranscript(true);
    await onGenerateTranscript(video.url);
    setIsGeneratingTranscript(false);
  };

  const handleSummary = async () => {
    if (!video.transcript) {
      toast.error("Please generate transcript first");
      return;
    }
    setIsGeneratingSummary(true);
    try {
      await onGenerateSummary(video.video_id);
    } catch (error) {
      toast.error("Failed to generate summary");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen((prev) => !prev);
  };

  return (
    <ExpandableCard
      icon={<DocumentIcon className="w-6 h-6 mr-2 text-gray-400" />}
      title="Transcript & Summary"
      isExpanded={isFullScreen}
      onToggleExpand={toggleFullScreen}
    >
      <div
        className={`flex-1 transition-all duration-500 ease-in-out ${
          isFullScreen ? "md:px-4" : ""
        }`}
      >
        <div
          className={`flex gap-4 mb-4 ${
            isFullScreen ? "flex-row" : "flex-col sm:flex-row"
          }`}
        >
          {!video.hasTranscript && (
            <ActionButton
              variant="primary"
              handleAction={handleTranscript}
              actionName={"Transcript"}
              isLoading={isGeneratingTranscript}
              disabled={disabled || isGeneratingTranscript}
              icon={<SparklesIcon className="h-6" />}
            />
          )}
          {!video.hasSummary && (
            <ActionButton
              variant="secondary"
              handleAction={handleSummary}
              actionName={"Summary"}
              isLoading={isGeneratingSummary}
              disabled={disabled || isGeneratingSummary || !video.transcript}
              icon={<SparklesIcon className="h-6" />}
            />
          )}
        </div>

        <Summary
          isFullScreen={isFullScreen}
          summary={{
            transcript: video.transcript || "",
            summary: video.summary || "",
          }}
        />
      </div>
    </ExpandableCard>
  );
};

export default TranscriptSummaryPanel;

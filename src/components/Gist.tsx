import React, { useState } from "react";
import { toast } from "react-toastify";
import Transcript from "./Transcript";
import Summary from "./Summary";
import { VideoEntry } from "../App";
import { DocumentIcon, SparklesIcon } from "@heroicons/react/24/outline";
import ActionButton from "./ActionButton";
import { ExpandableCard } from "./ExpandableCard";

interface GistProps {
  video: VideoEntry;
  disabled?: boolean;
  onGenerateTranscript: (videoID: string) => Promise<void>;
  onGenerateSummary: (videoID: string) => Promise<void>;
}

const Gist: React.FC<GistProps> = ({
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to generate summary");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen((prev) => !prev);
  };

  const hasContent = video.transcript || video.summary;

  return (
    <ExpandableCard
      icon={<DocumentIcon className="w-6 h-6 mr-2 text-gray-400" />}
      title="Gist"
      isExpanded={isFullScreen}
      onToggleExpand={toggleFullScreen}
      actionBar={{
        content: (
          <div className="flex justify-between items-center gap-2">
            <ActionButton
              variant="primary"
              handleAction={handleTranscript}
              actionName={"Transcript"}
              isLoading={isGeneratingTranscript}
              disabled={disabled || isGeneratingTranscript}
              icon={<SparklesIcon className="h-6" />}
            />
            <ActionButton
              hidden={!video.transcript}
              variant="secondary"
              handleAction={handleSummary}
              actionName={"Summary"}
              isLoading={isGeneratingSummary}
              disabled={disabled || isGeneratingSummary || !video.transcript}
              icon={<SparklesIcon className="h-6" />}
            />
          </div>
        ),
        position: "right",
      }}
    >
      <div
        className={`w-full h-fit transition-all duration-500 ease-in-out mt-2 ${
          isFullScreen ? "md:px-4" : ""
        }`}
      >
        {hasContent ? (
          <div
            className={`flex flex-col gap-4 ${
              isFullScreen ? "md:flex-row" : ""
            }`}
          >
            <Transcript
              transcript={video.transcript || ""}
              isFullScreen={isFullScreen}
            />
            <Summary
              summary={video.summary || ""}
              isFullScreen={isFullScreen}
            />
          </div>
        ) : (
          <div className="text-center text-gray-400 py-4">
            <p>No transcript or summary available.</p>
            <p>Click the "Transcript" button to get started.</p>
          </div>
        )}
      </div>
    </ExpandableCard>
  );
};

export default Gist;

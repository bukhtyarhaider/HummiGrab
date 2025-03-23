import React, { useState } from "react";
import { toast } from "react-toastify";
import Summary from "./Summary";
import { VideoEntry } from "../App";
import { SparklesIcon } from "@heroicons/react/24/outline";
import ActionButton from "./ActionButton";

interface TranscriptSummaryPanelProps {
  video: VideoEntry;
  disabled?: boolean;
  onGenerateTranscript: (downloadId: string) => Promise<void>;
  onGenerateSummary: (downloadId: string) => Promise<void>;
}

const TranscriptSummaryPanel: React.FC<TranscriptSummaryPanelProps> = ({
  video,
  disabled,
  onGenerateTranscript,
  onGenerateSummary,
}) => {
  const [isGeneratingTranscript, setIsGeneratingTranscript] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

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

  return (
    <div className="mt-4 bg-gray-800 p-4 rounded-lg shadow-md w-full">
      <h2 className="text-xl font-semibold mb-4 text-white">
        Transcript & Summary
      </h2>
      <div className="flex gap-4 mb-4">
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
      {(video.transcript || video.summary) && (
        <Summary
          summary={{
            transcript: video.transcript || "",
            summary: video.summary || "",
          }}
        />
      )}
    </div>
  );
};

export default TranscriptSummaryPanel;

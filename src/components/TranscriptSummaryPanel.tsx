import React, { useState } from "react";
import { toast } from "react-toastify";
import Summary from "./Summary";

interface TranscriptSummaryPanelProps {
  downloadId: string;
  video: {
    transcript?: string;
    summary?: string;
  };
  disabled?: boolean;
  onGenerateTranscript: (downloadId: string) => Promise<void>;
  onGenerateSummary: (downloadId: string) => Promise<void>;
}

const TranscriptSummaryPanel: React.FC<TranscriptSummaryPanelProps> = ({
  downloadId,
  video,
  disabled,
  onGenerateTranscript,
  onGenerateSummary,
}) => {
  const [isGeneratingTranscript, setIsGeneratingTranscript] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const handleTranscript = async () => {
    setIsGeneratingTranscript(true);
    try {
      await onGenerateTranscript(downloadId);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to generate transcript");
    } finally {
      setIsGeneratingTranscript(false);
    }
  };

  const handleSummary = async () => {
    if (!video.transcript) {
      toast.error("Please generate transcript first");
      return;
    }
    setIsGeneratingSummary(true);
    try {
      await onGenerateSummary(downloadId);
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
        <button
          onClick={handleTranscript}
          disabled={disabled || isGeneratingTranscript}
          className="flex-1 px-4 py-2 bg-blue-600 rounded-lg text-white font-medium transition duration-300 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          {isGeneratingTranscript
            ? "Generating Transcript..."
            : "Get Transcript"}
        </button>
        <button
          onClick={handleSummary}
          disabled={disabled || isGeneratingSummary || !video.transcript}
          className="flex-1 px-4 py-2 bg-purple-600 rounded-lg text-white font-medium transition duration-300 hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-opacity-50 disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          {isGeneratingSummary ? "Generating Summary..." : "Get Summary"}
        </button>
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

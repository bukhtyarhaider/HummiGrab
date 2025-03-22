import React, { useState } from "react";

interface SummaryProps {
  summary?: {
    summary: string;
    transcript: string;
  };
}

const Summary: React.FC<SummaryProps> = ({ summary }) => {
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);

  if (!summary) return null;

  return (
    <div className="mt-4 space-y-4">
      {/* Summary Accordion */}
      <div className="bg-gray-700 rounded-lg">
        <button
          onClick={() => setIsSummaryOpen(!isSummaryOpen)}
          className="w-full p-4 text-left text-lg font-semibold flex justify-between items-center"
        >
          Video Summary
          <span>{isSummaryOpen ? "▼" : "▶"}</span>
        </button>
        {isSummaryOpen && (
          <div className="p-4 pt-0 prose prose-invert max-w-none text-gray-200">
            {summary.summary}
          </div>
        )}
      </div>

      {/* Transcript Accordion */}
      <div className="bg-gray-700 rounded-lg">
        <button
          onClick={() => setIsTranscriptOpen(!isTranscriptOpen)}
          className="w-full p-4 text-left text-lg font-semibold flex justify-between items-center"
        >
          Video Transcript
          <span>{isTranscriptOpen ? "▼" : "▶"}</span>
        </button>
        {isTranscriptOpen && (
          <div className="p-4 pt-0 prose prose-invert max-w-none text-gray-200">
            {summary.transcript}
          </div>
        )}
      </div>
    </div>
  );
};

export default Summary;

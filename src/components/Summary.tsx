import React, { useState } from "react";

interface SummaryProps {
  summary?: {
    summary: string;
    transcript: string;
  };
}

const parseMarkdown = (text: string): JSX.Element[] => {
  const lines = text.split("\n");
  const elements: JSX.Element[] = [];
  let inList = false;
  let listItems: JSX.Element[] = [];

  lines.forEach((line, index) => {
    // Skip empty lines
    if (!line.trim()) {
      if (inList && listItems.length > 0) {
        elements.push(
          <ul key={`ul-${index}`} className="list-disc pl-5 my-2">
            {listItems}
          </ul>
        );
        listItems = [];
        inList = false;
      }
      return;
    }

    // Heading
    if (line.startsWith('" ')) {
      elements.push(
        <h2 key={index} className="text-2xl font-bold mt-4 mb-2 text-white">
          {line.slice(2)}
        </h2>
      );
      return;
    }

    // Heading
    if (line.startsWith("# ")) {
      elements.push(
        <h1 key={index} className="text-2xl font-bold mt-4 mb-2 text-white">
          {line.slice(2)}
        </h1>
      );
      return;
    }

    // Heading
    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={index} className="text-2xl font-bold mt-4 mb-2 text-white">
          {line.slice(2)}
        </h2>
      );
      return;
    }

    // List items
    if (line.startsWith("- ") || line.startsWith("* ")) {
      inList = true;
      const content = line.slice(2);
      listItems.push(
        <li key={`li-${index}`} className="mb-1">
          {formatInline(content)}
        </li>
      );
      return;
    }

    // Paragraph with inline formatting
    elements.push(
      <p key={index} className="mb-2">
        {formatInline(line)}
      </p>
    );
  });

  // Add any remaining list items
  if (inList && listItems.length > 0) {
    elements.push(
      <ul key="final-ul" className="list-disc pl-5 my-2">
        {listItems}
      </ul>
    );
  }

  return elements;
};

const formatInline = (text: string): React.ReactNode => {
  // Process bold text (**text**)
  const parts = text.split(/(\*\*[^*]+\*\*)/);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`bold-${index}`} className="font-bold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={`text-${index}`}>{part}</span>;
  });
};

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
          className="w-full p-4 text-left text-lg font-semibold flex justify-between items-center text-white hover:bg-gray-600 transition-colors"
        >
          Video Summary
          <span className="text-gray-400">{isSummaryOpen ? "▼" : "▶"}</span>
        </button>
        {isSummaryOpen && (
          <div className="p-4 pt-0 text-gray-200">
            {parseMarkdown(summary.summary)}
          </div>
        )}
      </div>

      {/* Transcript Accordion */}
      <div className="bg-gray-700 rounded-lg">
        <button
          onClick={() => setIsTranscriptOpen(!isTranscriptOpen)}
          className="w-full p-4 text-left text-lg font-semibold flex justify-between items-center text-white hover:bg-gray-600 transition-colors"
        >
          Video Transcript
          <span className="text-gray-400">{isTranscriptOpen ? "▼" : "▶"}</span>
        </button>
        {isTranscriptOpen && (
          <div className="p-4 pt-0 text-gray-200">
            {/* Transcript is typically plain text, but we'll parse it in case it contains Markdown */}
            {parseMarkdown(summary.transcript)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Summary;

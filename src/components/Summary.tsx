import React, { useEffect, useRef, useState } from "react";
import Accordion from "./Accordion";
import MarkdownParser from "./MarkdownParser";

interface SummaryProps {
  summary: {
    summary: string;
    transcript: string;
  };
  isFullScreen?: boolean;
}

const Summary: React.FC<SummaryProps> = ({ summary, isFullScreen = false }) => {
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const [panelHeight, setPanelHeight] = useState<number | "auto">("auto");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isFullScreen) {
      setIsTranscriptOpen(true);
      setIsSummaryOpen(true);
    }

    if (!isFullScreen || !containerRef.current) {
      setPanelHeight("auto");
      return;
    }

    const updateHeight = () => {
      if (containerRef.current) {
        const availableHeight = window.innerHeight - 100;
        setPanelHeight(availableHeight);
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, [isFullScreen]);

  return (
    <div
      ref={containerRef}
      className={`transition-all duration-500 ease-in-out flex-1 flex ${
        isFullScreen
          ? "flex-row h-full gap-4 overflow-hidden"
          : "flex-col space-y-4"
      }`}
      style={{ height: isFullScreen ? `${panelHeight}px` : "auto" }}
    >
      {/* Transcript Section */}
      <div
        className={`transition-all duration-500 ease-in-out ${
          isFullScreen ? "w-1/2 h-full overflow-hidden" : "w-full"
        }`}
      >
        <Accordion
          disabled={isFullScreen}
          title="Video Transcript"
          content={
            <div className="overflow-auto h-full">{summary.transcript}</div>
          }
          isOpen={isTranscriptOpen}
          onToggle={() => setIsTranscriptOpen(!isTranscriptOpen)}
        />
      </div>

      {/* Summary Section */}
      <div
        className={`transition-all duration-500 ease-in-out ${
          isFullScreen ? "w-1/2 h-full overflow-hidden" : "w-full"
        }`}
      >
        <Accordion
          disabled={isFullScreen}
          title="Video Summary"
          content={
            <div className="overflow-auto h-full">
              <MarkdownParser markdown={summary.summary} />
            </div>
          }
          isOpen={isSummaryOpen}
          onToggle={() => setIsSummaryOpen(!isSummaryOpen)}
        />
      </div>
    </div>
  );
};

export default Summary;

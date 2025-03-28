import React, { useEffect, useRef, useState } from "react";
import Accordion from "./Accordion";
import MarkdownParser from "./MarkdownParser";

interface SummaryProps {
  summary: string;
  isFullScreen?: boolean;
}

const Summary: React.FC<SummaryProps> = ({ summary, isFullScreen = false }) => {
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [panelHeight, setPanelHeight] = useState<number | "auto">("auto");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isFullScreen) {
      setIsSummaryOpen(true);
    }

    if (!isFullScreen || !containerRef.current) {
      setIsSummaryOpen(false);
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

  if (!summary) return null;

  return (
    <div
      ref={containerRef}
      className={`transition-all duration-500 ease-in-out ${
        isFullScreen ? "w-full h-full" : "w-full"
      }`}
      style={{ height: isFullScreen ? `${panelHeight}px` : "auto" }}
    >
      <Accordion
        disabled={isFullScreen}
        title="Video Summary"
        content={
          <div className="h-full">
            <MarkdownParser markdown={summary} />
          </div>
        }
        isOpen={isSummaryOpen}
        onToggle={() => setIsSummaryOpen(!isSummaryOpen)}
      />
    </div>
  );
};

export default Summary;

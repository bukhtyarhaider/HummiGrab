import React, { useEffect, useRef, useState } from "react";
import Accordion from "./Accordion";

interface TranscriptProps {
  transcript: string;
  isFullScreen?: boolean;
}

const Transcript: React.FC<TranscriptProps> = ({
  transcript,
  isFullScreen = false,
}) => {
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const [panelHeight, setPanelHeight] = useState<number | "auto">("auto");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isFullScreen) {
      setIsTranscriptOpen(true);
    }

    if (!isFullScreen || !containerRef.current) {
      setIsTranscriptOpen(false);
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

  if (!transcript) return null;

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
        title="Video Transcript"
        content={<div className="h-full">{transcript}</div>}
        isOpen={isTranscriptOpen}
        onToggle={() => setIsTranscriptOpen(!isTranscriptOpen)}
      />
    </div>
  );
};

export default Transcript;

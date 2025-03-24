import React, { JSX, useEffect, useRef, useState } from "react";
import Accordion from "./Accordion";

interface SummaryProps {
  summary: {
    summary: string;
    transcript: string;
  };
  isFullScreen?: boolean;
}

interface MarkdownElementProps {
  content: string;
  index: number;
}

const parseMarkdown = (text: string): JSX.Element[] => {
  const lines = text.split("\n");
  const elements: JSX.Element[] = [];
  let listItems: JSX.Element[] = [];
  let inOrderedList = false;
  let inUnorderedList = false;

  const createHeading = ({
    content,
    index,
    level,
  }: MarkdownElementProps & { level: 1 | 2 | 3 }) => {
    const text = content.replace(/^#+ /, "");
    const Heading = `h${level}` as keyof JSX.IntrinsicElements;
    return (
      <Heading
        key={`h${level}-${index}`}
        className={`text-${4 - level}xl font-bold mt-4 mb-2 text-white`}
      >
        {formatInline(text)}
      </Heading>
    );
  };

  const createListItem = ({ content, index }: MarkdownElementProps) => (
    <li key={`li-${index}`} className="mb-1">
      {formatInline(content.trim().replace(/^[-*] /, ""))}
    </li>
  );

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    // Handle empty lines and list termination
    if (!trimmedLine) {
      if ((inOrderedList || inUnorderedList) && listItems.length > 0) {
        const ListTag = inOrderedList ? "ol" : "ul";
        elements.push(
          <ListTag
            key={`${ListTag}-${index}`}
            className={`${
              inOrderedList ? "list-decimal" : "list-disc"
            } pl-5 my-2`}
          >
            {listItems}
          </ListTag>
        );
        listItems = [];
        inOrderedList = inUnorderedList = false;
      }
      return;
    }

    // Headings
    if (trimmedLine.startsWith("# ")) {
      elements.push(createHeading({ content: trimmedLine, index, level: 1 }));
      return;
    }
    if (trimmedLine.startsWith("## ")) {
      elements.push(createHeading({ content: trimmedLine, index, level: 2 }));
      return;
    }
    if (trimmedLine.startsWith("### ")) {
      elements.push(createHeading({ content: trimmedLine, index, level: 3 }));
      return;
    }

    // Ordered list
    if (/^\d+\.\s/.test(trimmedLine)) {
      if (!inOrderedList && listItems.length > 0) {
        elements.push(
          <ul key={`ul-${index}`} className="list-disc pl-5 my-2">
            {listItems}
          </ul>
        );
        listItems = [];
      }
      inOrderedList = true;
      listItems.push(
        createListItem({ content: trimmedLine.replace(/^\d+\.\s/, ""), index })
      );
      return;
    }

    // Unordered list
    if (trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ")) {
      if (inOrderedList && listItems.length > 0) {
        elements.push(
          <ol key={`ol-${index}`} className="list-decimal pl-5 my-2">
            {listItems}
          </ol>
        );
        listItems = [];
      }
      inUnorderedList = true;
      listItems.push(createListItem({ content: trimmedLine, index }));
      return;
    }

    // Paragraph
    elements.push(
      <p key={`p-${index}`} className="mb-2">
        {formatInline(trimmedLine)}
      </p>
    );
  });

  // Handle remaining list items
  if (listItems.length > 0) {
    const ListTag = inOrderedList ? "ol" : "ul";
    elements.push(
      <ListTag
        key={`${ListTag}-final`}
        className={`${inOrderedList ? "list-decimal" : "list-disc"} pl-5 my-2`}
      >
        {listItems}
      </ListTag>
    );
  }

  return elements;
};

const formatInline = (text: string): React.ReactNode => {
  let content = text;
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;

  // Handle bold (**text**) and italic (*text*)
  const pattern = /(\*\*[^*]+\*\*)|(\*[^*]+\*)/g;
  let match;

  while ((match = pattern.exec(content)) !== null) {
    const matchStart = match.index;
    const matchEnd = matchStart + match[0].length;

    // Add text before the match
    if (matchStart > lastIndex) {
      elements.push(content.slice(lastIndex, matchStart));
    }

    // Handle the matched formatting
    const matchedText = match[0];
    const innerText = matchedText.slice(
      matchedText.startsWith("**") ? 2 : 1,
      -matchedText.startsWith("**") ? -2 : -1
    );

    if (matchedText.startsWith("**")) {
      elements.push(
        <strong key={`bold-${matchStart}`} className="font-bold">
          {innerText}
        </strong>
      );
    } else {
      elements.push(
        <em key={`italic-${matchStart}`} className="italic">
          {innerText}
        </em>
      );
    }

    lastIndex = matchEnd;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    elements.push(content.slice(lastIndex));
  }

  return elements.length === 1 ? elements[0] : elements;
};

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
              {parseMarkdown(summary.summary)}
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

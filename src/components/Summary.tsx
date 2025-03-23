import React, { useState } from "react";

interface SummaryProps {
  summary?: {
    summary: string;
    transcript: string;
  };
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

const Summary: React.FC<SummaryProps> = ({ summary }) => {
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);

  if (!summary) return null;

  return (
    <div className="mt-4 space-y-4">
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
    </div>
  );
};

export default Summary;

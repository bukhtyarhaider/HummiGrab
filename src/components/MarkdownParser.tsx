import React, { JSX } from "react";

interface MarkdownElementProps {
  content: string;
  index: number;
}

type HeadingLevel = 1 | 2 | 3;

interface MarkdownParserProps {
  markdown: string;
}

const MarkdownParser: React.FC<MarkdownParserProps> = ({ markdown }) => {
  const lines = markdown.split("\n");
  const elements: JSX.Element[] = [];
  let listItems: JSX.Element[] = [];
  let listType: "ol" | "ul" | null = null;

  const closeListIfNeeded = (key: string) => {
    if (listType && listItems.length > 0) {
      const ListTag = listType === "ol" ? "ol" : "ul";
      elements.push(
        React.createElement(
          ListTag,
          {
            key: key,
            className: `${
              listType === "ol" ? "list-decimal" : "list-disc"
            } pl-5 my-2`,
          },
          listItems
        )
      );
      listItems = [];
      listType = null;
    }
  };

  const createHeading = (
    content: string,
    index: number,
    level: HeadingLevel
  ) => {
    const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
    return (
      <HeadingTag
        key={`heading-${index}`}
        className={`text-${4 - level}xl font-bold mt-4 mb-2 text-white`}
      >
        {formatInline(content.replace(/^#+\s/, ""))}
      </HeadingTag>
    );
  };

  const createListItem = ({ content, index }: MarkdownElementProps) => (
    <li key={`li-${index}`} className="mb-1">
      {formatInline(content.trim())}
    </li>
  );

  const formatInline = (text: string): React.ReactNode => {
    const elements: React.ReactNode[] = [];
    const pattern = /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)/g;
    let lastIndex = 0;
    let match;

    while ((match = pattern.exec(text)) !== null) {
      if (match.index > lastIndex) {
        elements.push(text.slice(lastIndex, match.index));
      }

      if (match[1]) {
        elements.push(
          <strong key={`bold-${match.index}`} className="font-bold">
            {match[2]}
          </strong>
        );
      } else if (match[3]) {
        elements.push(
          <em key={`italic-${match.index}`} className="italic">
            {match[4]}
          </em>
        );
      }

      lastIndex = pattern.lastIndex;
    }

    if (lastIndex < text.length) {
      elements.push(text.slice(lastIndex));
    }

    return elements.length === 1 ? elements[0] : elements;
  };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      closeListIfNeeded(`list-${index}`);
      return;
    }

    if (trimmedLine.startsWith("### ")) {
      closeListIfNeeded(`list-${index}`);
      elements.push(createHeading(trimmedLine, index, 3));
    } else if (trimmedLine.startsWith("## ")) {
      closeListIfNeeded(`list-${index}`);
      elements.push(createHeading(trimmedLine, index, 2));
    } else if (trimmedLine.startsWith("# ")) {
      closeListIfNeeded(`list-${index}`);
      elements.push(createHeading(trimmedLine, index, 1));
    } else if (/^\d+\.\s/.test(trimmedLine)) {
      if (listType !== "ol") closeListIfNeeded(`list-${index}`);
      listType = "ol";
      listItems.push(
        createListItem({ content: trimmedLine.replace(/^\d+\.\s/, ""), index })
      );
    } else if (/^[-*]\s/.test(trimmedLine)) {
      if (listType !== "ul") closeListIfNeeded(`list-${index}`);
      listType = "ul";
      listItems.push(
        createListItem({ content: trimmedLine.replace(/^[-*]\s/, ""), index })
      );
    } else {
      closeListIfNeeded(`list-${index}`);
      elements.push(
        <p key={`paragraph-${index}`} className="mb-2">
          {formatInline(trimmedLine)}
        </p>
      );
    }
  });

  closeListIfNeeded(`list-final`);

  return <>{elements}</>;
};

export default MarkdownParser;

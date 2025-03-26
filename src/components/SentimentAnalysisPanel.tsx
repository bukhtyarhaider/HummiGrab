// src/components/SentimentAnalysisPanel.tsx
import React, { useState, useRef, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { ExpandableCard } from "./ExpandableCard";
import ActionButton from "./ActionButton";

interface SentimentSummary {
  positive: { count: number; percentage: number };
  negative: { count: number; percentage: number };
  neutral: { count: number; percentage: number };
  total_analyzed: number;
  total_comments: number;
}

interface SentimentResult {
  id: string;
  text: string;
  sentiment: "positive" | "negative" | "neutral";
  polarity: number;
  subjectivity: number;
}

interface SentimentAnalysisResponse {
  video_id: string;
  sentiment_results: SentimentResult[];
  sentiment_summary: SentimentSummary;
}

interface SentimentAnalysisPanelProps {
  url: string;
  disabled: boolean;
}

const PAGE_SIZE = 20; // Number of comments per page

const SentimentAnalysisPanel: React.FC<SentimentAnalysisPanelProps> = ({
  url,
  disabled,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [sentimentData, setSentimentData] =
    useState<SentimentAnalysisResponse | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<
    "all" | "positive" | "negative" | "neutral"
  >("all");
  const [page, setPage] = useState<number>(1); // Current page for pagination
  const [hasMore, setHasMore] = useState<boolean>(true); // Flag for more comments
  const [displayedComments, setDisplayedComments] = useState<SentimentResult[]>(
    []
  ); // Paginated comments
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const BASE_URL = "/api";

  const fetchSentimentAnalysis = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/analyze_sentiment`, {
        url: url,
      });
      const data: SentimentAnalysisResponse = response.data;
      setSentimentData(data);
      setIsExpanded(true);
      setPage(1);
      setDisplayedComments(data.sentiment_results.slice(0, PAGE_SIZE));
      setHasMore(data.sentiment_results.length > PAGE_SIZE);
      toast.success("Sentiment analysis completed", { position: "top-right" });
    } catch (error) {
      const err = error as AxiosError;
      const errorMessage =
        (err.response?.data as any)?.error ||
        "Failed to fetch sentiment analysis";
      toast.error(errorMessage, { position: "top-right" });
    } finally {
      setLoading(false);
    }
  };

  const filteredComments =
    sentimentData?.sentiment_results.filter((comment) =>
      activeTab === "all" ? true : comment.sentiment === activeTab
    ) || [];

  // Load more comments for the current tab
  const loadMoreComments = () => {
    if (!sentimentData || !hasMore || loading) return;
    setLoading(true);
    const nextPage = page + 1;
    const startIndex = (nextPage - 1) * PAGE_SIZE;
    const endIndex = nextPage * PAGE_SIZE;
    const moreComments = filteredComments.slice(startIndex, endIndex);

    setDisplayedComments((prev) => [...prev, ...moreComments]);
    setPage(nextPage);
    setHasMore(endIndex < filteredComments.length);
    setLoading(false);
  };

  // Handle scroll event
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container || !isExpanded) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    if (scrollTop + clientHeight >= scrollHeight - 50 && hasMore && !loading) {
      loadMoreComments();
    }
  };

  // Reset pagination when tab changes or data is fetched
  useEffect(() => {
    if (!sentimentData) return;
    setPage(1);
    setDisplayedComments(filteredComments.slice(0, PAGE_SIZE));
    setHasMore(filteredComments.length > PAGE_SIZE);
  }, [activeTab, sentimentData]);

  // Add scroll event listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [sentimentData, page, hasMore, loading, activeTab]);

  return (
    <div
      className={`${
        isExpanded ? "fixed inset-0 z-50 p-6 overflow-y-auto" : "relative"
      }`}
    >
      <ExpandableCard
        icon={
          <ChatBubbleLeftRightIcon className="w-6 h-6 mr-2 text-gray-400" />
        }
        title="Sentiment Analysis"
        onToggleExpand={() => setIsExpanded(!isExpanded)}
        isExpanded={isExpanded}
        actionBar={{
          content: (
            <div className="flex justify-between items-center">
              <ActionButton
                variant="primary"
                handleAction={fetchSentimentAnalysis}
                actionName="Analyze"
                isLoading={loading}
                disabled={disabled || loading}
                icon={<ChatBubbleLeftRightIcon className="h-6" />}
              />
            </div>
          ),
          position: "right",
        }}
      >
        <div className="mt-1 bg-gray-800 p-6 rounded-lg shadow-md w-full">
          {!sentimentData && !loading && (
            <p className="text-gray-400 mb-4 text-center">
              Click "Analyze" to explore the sentiment of comments for this
              video.
            </p>
          )}
          {sentimentData && (
            <div>
              {/* Summary Section (Always Visible) */}
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-white">Summary</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-green-600 to-green-800 p-4 rounded-lg shadow-md">
                  <p className="font-semibold text-green-100">Positive</p>
                  <p className="text-green-200">
                    {sentimentData.sentiment_summary.positive.count} comments
                  </p>
                  <p className="text-green-300 text-lg font-bold">
                    {sentimentData.sentiment_summary.positive.percentage.toFixed(
                      1
                    )}
                    %
                  </p>
                </div>
                <div className="bg-gradient-to-br from-red-600 to-red-800 p-4 rounded-lg shadow-md">
                  <p className="font-semibold text-red-100">Negative</p>
                  <p className="text-red-200">
                    {sentimentData.sentiment_summary.negative.count} comments
                  </p>
                  <p className="text-red-300 text-lg font-bold">
                    {sentimentData.sentiment_summary.negative.percentage.toFixed(
                      1
                    )}
                    %
                  </p>
                </div>
                <div className="bg-gradient-to-br from-gray-500 to-gray-700 p-4 rounded-lg shadow-md">
                  <p className="font-semibold text-gray-100">Neutral</p>
                  <p className="text-gray-200">
                    {sentimentData.sentiment_summary.neutral.count} comments
                  </p>
                  <p className="text-gray-300 text-lg font-bold">
                    {sentimentData.sentiment_summary.neutral.percentage.toFixed(
                      1
                    )}
                    %
                  </p>
                </div>
              </div>
              <p className="text-gray-300 mt-3 text-sm">
                Total Analyzed: {sentimentData.sentiment_summary.total_analyzed}{" "}
                / {sentimentData.sentiment_summary.total_comments} comments
              </p>

              {isExpanded && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Comments
                  </h3>
                  <div className="flex border-b border-gray-700 mb-4">
                    {["all", "positive", "negative", "neutral"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab as typeof activeTab)}
                        className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                          activeTab === tab
                            ? "border-b-2 border-blue-500 text-blue-400"
                            : "text-gray-400 hover:text-gray-200"
                        }`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)} (
                        {tab === "all"
                          ? sentimentData.sentiment_results.length
                          : sentimentData.sentiment_summary[
                              tab as keyof SentimentSummary
                            ].count}
                        )
                      </button>
                    ))}
                  </div>

                  <div
                    ref={scrollContainerRef}
                    className="max-h-[60vh] overflow-y-auto space-y-4"
                  >
                    {filteredComments.length === 0 ? (
                      <div className="text-center py-8">
                        <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto text-gray-500" />
                        <p className="text-gray-400 mt-2">
                          No {activeTab === "all" ? "" : activeTab} comments
                          found for this video.
                        </p>
                      </div>
                    ) : displayedComments.length > 0 ? (
                      displayedComments.map((result) => (
                        <div
                          key={result.id}
                          className={`p-4 rounded-lg shadow-md transition-all duration-200 ${
                            result.sentiment === "positive"
                              ? "bg-green-900/50 border-l-4 border-green-500 hover:bg-green-900/70"
                              : result.sentiment === "negative"
                              ? "bg-red-900/50 border-l-4 border-red-500 hover:bg-red-900/70"
                              : "bg-gray-700/50 border-l-4 border-gray-500 hover:bg-gray-700/70"
                          }`}
                        >
                          <p className="text-sm text-white leading-relaxed">
                            {result.text}
                          </p>
                          <div className="mt-2 flex gap-4 text-xs text-gray-300">
                            <span className="bg-gray-800/50 px-2 py-1 rounded">
                              Sentiment:{" "}
                              <span className="font-medium">
                                {result.sentiment}
                              </span>
                            </span>
                            <span className="bg-gray-800/50 px-2 py-1 rounded">
                              Polarity:{" "}
                              <span className="font-medium">
                                {result.polarity.toFixed(2)}
                              </span>
                            </span>
                            <span className="bg-gray-800/50 px-2 py-1 rounded">
                              Subjectivity:{" "}
                              <span className="font-medium">
                                {result.subjectivity.toFixed(2)}
                              </span>
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto text-gray-500" />
                        <p className="text-gray-400 mt-2">
                          No {activeTab === "all" ? "" : activeTab} comments
                          loaded yet.
                        </p>
                      </div>
                    )}
                    {loading && hasMore && (
                      <div className="text-center py-4">
                        <svg
                          className="animate-spin h-6 w-6 mx-auto text-blue-400"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8v-8H4z"
                          ></path>
                        </svg>
                        <p className="text-gray-400 mt-2">
                          Loading more comments...
                        </p>
                      </div>
                    )}
                    {!hasMore && filteredComments.length > 0 && (
                      <p className="text-gray-400 text-center py-4">
                        No more {activeTab === "all" ? "" : activeTab} comments
                        to load.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </ExpandableCard>
    </div>
  );
};

export default SentimentAnalysisPanel;

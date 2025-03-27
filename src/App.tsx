import React, { useState, useEffect, useCallback } from "react";
import axios, { AxiosError } from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import VideoInfo from "./components/VideoInfo";
import History from "./components/History";
import TranscriptSummaryPanel from "./components/TranscriptSummaryPanel";
import { ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import SentimentAnalysisPanel from "./components/SentimentAnalysisPanel";
import Gist from "./components/Gist";

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

export interface SentimentAnalysisResponse {
  video_id: string;
  sentiment_results: SentimentResult[];
  sentiment_summary: SentimentSummary;
}

interface VideoFormat {
  format_id: string;
  label: string;
}

export interface VideoEntry {
  video_id: string;
  url: string;
  title: string;
  thumbnail: string;
  duration?: number;
  video_formats?: VideoFormat[];
  downloaded: boolean;
  downloadId?: string;
  summary?: string;
  transcript?: string;
  hasSummary?: boolean;
  hasTranscript?: boolean;
  sentimentData?: SentimentAnalysisResponse;
  hasAnalysis?: boolean;
}

const App: React.FC = () => {
  const [url, setUrl] = useState<string>("");
  const [videoInfo, setVideoInfo] = useState<VideoEntry | null>(null);
  const [history, setHistory] = useState<VideoEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [downloadId, setDownloadId] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [lastProgressTime, setLastProgressTime] = useState<number>(0);
  const [status, setStatus] = useState<"downloading" | "error" | "">("");
  const [error, setError] = useState<string | null>(null);

  const BASE_URL = "/api";
  const PROGRESS_TIMEOUT = 30000; // 30 seconds

  // Helper to extract YouTube video ID
  const extractYouTubeVideoId = (url: string): string | null => {
    // This regex covers:
    // - https://www.youtube.com/watch?v=VIDEO_ID
    // - https://youtu.be/VIDEO_ID
    // - https://www.youtube.com/embed/VIDEO_ID
    // - https://www.youtube.com/shorts/VIDEO_ID
    const regex =
      /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Load history from localStorage
  useEffect(() => {
    const storedHistory = localStorage.getItem("videoHistory");
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
  }, []);

  const fetchSentimentAnalysis = async (videoUrl: string): Promise<void> => {
    setLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/analyze_sentiment`, {
        url: videoUrl,
      });
      const sentimentData: SentimentAnalysisResponse = response.data;

      setVideoInfo((prev) =>
        prev && prev.url === videoUrl
          ? { ...prev, sentimentData, hasAnalysis: true }
          : prev
      );
      const updatedHistory = history.map((entry) =>
        entry.url === videoUrl
          ? { ...entry, sentimentData, hasAnalysis: true }
          : entry
      );
      setHistory(updatedHistory);
      localStorage.setItem("videoHistory", JSON.stringify(updatedHistory));
      toast.success("Sentiment analysis completed", { position: "top-right" });
    } catch (error) {
      const err = error as AxiosError;
      const errorMessage =
        (err.response?.data as any)?.error ||
        "Failed to fetch sentiment analysis";
      setError(errorMessage);
      toast.error(errorMessage, { position: "top-right" });
    } finally {
      setLoading(false);
    }
  };

  // Generate transcript
  const generateTranscript = async (url: string): Promise<void> => {
    try {
      const response = await axios.post(`${BASE_URL}/generate_transcript`, {
        url: url,
      });
      const transcriptData = response.data;
      setVideoInfo((prev) =>
        prev
          ? {
              ...prev,
              transcript: transcriptData.transcript,
              hasTranscript: true,
            }
          : null
      );
      const updatedHistory = history.map((entry) =>
        entry.video_id === transcriptData.video_id
          ? {
              ...entry,
              transcript: transcriptData.transcript,
              hasTranscript: true,
            }
          : entry
      );
      setHistory(updatedHistory);
      localStorage.setItem("videoHistory", JSON.stringify(updatedHistory));
      toast.success("Transcript generated successfully", {
        position: "top-right",
      });
    } catch (error) {
      setLoading(false);
      const err = error as AxiosError;
      const errorMessage =
        (err.response?.data as any)?.error || "Failed to generate transcript";
      setError(errorMessage);
      toast.error(errorMessage, { position: "top-right" });
      throw error;
    }
  };

  // Generate summary (only works if transcript exists)
  const generateSummary = async (video_id: string): Promise<void> => {
    if (!videoInfo?.transcript) {
      toast.error("Please generate transcript first", {
        position: "top-right",
      });
      return;
    }
    try {
      const response = await axios.post(`${BASE_URL}/generate_summary`, {
        video_id: video_id,
      });
      const summaryData = response.data;
      setVideoInfo((prev) =>
        prev
          ? {
              ...prev,
              summary: summaryData.summary,
              hasSummary: true,
            }
          : null
      );
      const updatedHistory = history.map((entry) =>
        entry.video_id === summaryData.video_id
          ? {
              ...entry,
              summary: summaryData.summary,
              hasSummary: true,
            }
          : entry
      );
      setHistory(updatedHistory);
      localStorage.setItem("videoHistory", JSON.stringify(updatedHistory));
      toast.success("Summary generated successfully", {
        position: "top-right",
      });
    } catch (error) {
      const err = error as AxiosError;
      const errorMessage =
        (err.response?.data as any)?.error || "Failed to generate summary";
      setError(errorMessage);
      toast.error(errorMessage, { position: "top-right" });
      throw error;
    }
  };

  const checkProgress = useCallback(async () => {
    if (!downloadId || status !== "downloading") return;
    try {
      const response = await axios.get(
        `${BASE_URL}/progress?download_id=${downloadId}`
      );
      const {
        progress,
        status: newStatus,
        error: backendError,
      } = response.data;
      setProgress(progress);
      setStatus(newStatus);
      if (progress > 0 && progress < 100) {
        setLastProgressTime(Date.now());
      }
      if (newStatus === "completed") {
        await downloadFile();
        updateDownloadStatus(true);
        setVideoInfo((prev) =>
          prev ? { ...prev, downloaded: true, downloadId } : null
        );
        toast.success(`Download completed: ${videoInfo?.title || "Video"}`, {
          position: "top-right",
        });
        setStatus("");
        setDownloadId(null);
        setProgress(0);
      } else if (newStatus === "error") {
        setError(backendError || "Download failed");
        toast.error(backendError || "Download failed", {
          position: "top-right",
        });
        setStatus("");
        setDownloadId(null);
        setProgress(0);
      } else if (
        Date.now() - lastProgressTime > PROGRESS_TIMEOUT &&
        progress < 100
      ) {
        await cancelDownload();
        setError("Download stalled");
        toast.error("Download stalled", { position: "top-right" });
      }
    } catch (error) {
      const err = error as AxiosError;
      if (err.response?.status === 404) {
        setError(
          "Download task not found. It may have been cancelled or expired."
        );
        toast.error(
          "Download task not found. It may have been cancelled or expired.",
          {
            position: "top-right",
          }
        );
        setStatus("");
        setDownloadId(null);
        setProgress(0);
      } else {
        setError("Error checking progress");
        toast.error("Error checking progress", { position: "top-right" });
        setStatus("error");
      }
    }
  }, [downloadId, status, lastProgressTime, videoInfo?.title]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (downloadId && status === "downloading") {
      const timeout = setTimeout(() => {
        interval = setInterval(() => checkProgress(), 2000);
      }, 2000);
      return () => {
        clearTimeout(timeout);
        if (interval) clearInterval(interval);
      };
    }
  }, [downloadId, status, checkProgress]);

  const fetchVideoInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const videoId = extractYouTubeVideoId(url);
    if (!videoId) {
      toast.error("Invalid YouTube URL", { position: "top-right" });
      setLoading(false);
      return;
    }
    const duplicate = history.find((entry) => entry.video_id === videoId);
    if (duplicate) {
      toast.info("This video is already stored", { position: "top-right" });
      setLoading(false);
      return;
    }
    try {
      const response = await axios.post(`${BASE_URL}/get_info`, { url });
      const data = response.data;
      const videoEntry: VideoEntry = {
        video_id: data.video_id,
        url,
        title: data.title,
        thumbnail: data.thumbnail,
        duration: data.duration,
        video_formats: data.video_formats,
        downloaded: false,
        hasSummary: false,
        hasTranscript: false,
        hasAnalysis: false,
      };
      const updatedHistory = [videoEntry, ...history];
      setHistory(updatedHistory);
      setVideoInfo(videoEntry);
      localStorage.setItem("videoHistory", JSON.stringify(updatedHistory));
    } catch (error) {
      const err = error as AxiosError;
      const errorMessage =
        (err.response?.data as any)?.error ||
        "Failed to fetch video info. Please check the URL.";
      setError(errorMessage);
      toast.error(errorMessage, { position: "top-right" });
    } finally {
      setLoading(false);
    }
  };

  const startDownload = async (formatId: string) => {
    if (!formatId) {
      setError("Please select a video format");
      toast.error("Please select a video format", { position: "top-right" });
      return;
    }
    setLoading(true);
    setError(null);
    setStatus("");
    try {
      const response = await axios.post(`${BASE_URL}/start_download`, {
        url: url || videoInfo?.url,
        video_format_id: formatId,
        video_id: videoInfo?.video_id,
        title: videoInfo?.title,
      });
      const { download_id } = response.data;
      if (!download_id) throw new Error("No download ID returned");
      setDownloadId(download_id);
      setStatus("downloading");
      setProgress(0);
      setLastProgressTime(Date.now());
    } catch (error) {
      const err = error as AxiosError;
      const errorMessage =
        (err.response?.data as any)?.error || "Failed to start download";
      setError(errorMessage);
      toast.error(errorMessage, { position: "top-right" });
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const cancelDownload = async () => {
    if (!downloadId) {
      setError("No active download to cancel");
      toast.error("No active download to cancel", { position: "top-right" });
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${BASE_URL}/cancel_download`, {
        download_id: downloadId,
      });
      setStatus("");
      setProgress(0);
      setDownloadId(null);
      toast.info("Download cancelled successfully", { position: "top-right" });
    } catch (error) {
      const err = error as AxiosError;
      const errorMessage =
        (err.response?.data as any)?.error || "Failed to cancel download";
      setError(errorMessage);
      toast.error(errorMessage, { position: "top-right" });
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = async () => {
    if (!downloadId) return;
    try {
      const response = await axios.get(
        `${BASE_URL}/get_file?download_id=${downloadId}`,
        {
          responseType: "blob",
        }
      );
      const blob = new Blob([response.data], { type: "video/mp4" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${videoInfo?.title || "video"}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      const err = error as AxiosError;
      setError("Failed to retrieve downloaded file");
      toast.error("Failed to retrieve downloaded file", {
        position: "top-right",
      });
    }
  };

  const updateDownloadStatus = (downloaded: boolean) => {
    if (!videoInfo) return;
    const updatedHistory = history.map((entry) =>
      entry.url === videoInfo.url ? { ...entry, downloaded, downloadId } : entry
    );
    setHistory(updatedHistory);
    setVideoInfo((prev) => (prev ? { ...prev, downloaded, downloadId } : null));
    localStorage.setItem("videoHistory", JSON.stringify(updatedHistory));
  };

  const removeHistory = (index: number) => {
    const updatedHistory = history.filter((_, i) => i !== index);
    setHistory(updatedHistory);
    localStorage.setItem("videoHistory", JSON.stringify(updatedHistory));
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch (err) {
      toast.error("Failed to paste from clipboard", { position: "top-right" });
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <header className="p-5 md:p-4 w-full flex flex-wrap justify-center items-center gap-4">
        <img
          src="/src/assets/images/logo.png"
          alt="App Logo"
          className="w-50 md:w-24 h-auto"
        />
        <form
          onSubmit={fetchVideoInfo}
          className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-1 min-w-[300px]"
        >
          <input
            type="text"
            placeholder="Enter YouTube URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            disabled={loading}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            aria-label="YouTube URL input"
          />
          <button
            type="button"
            onClick={handlePaste}
            disabled={loading}
            className="px-4 py-2 bg-gray-600 rounded transition duration-300 hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-500 disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap flex items-center justify-center gap-2"
            aria-label="Paste URL from clipboard"
          >
            <ClipboardDocumentIcon className="w-5 h-5" />
            Paste
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 rounded transition duration-300 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed whitespace-nowrap"
            aria-label="Get video information"
          >
            {loading ? "Loading..." : "Get Info"}
          </button>
        </form>
      </header>
      {error && (
        <div className="w-full max-w-3xl mx-auto p-3 bg-red-600 text-white rounded mb-4 flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-white hover:text-gray-200 focus:outline-none"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}
      <main className="flex flex-col-reverse md:flex-row w-full gap-4 p-4">
        <section className="w-full md:w-2/5">
          <History
            history={history}
            onVideoClick={(index) => setVideoInfo(history[index])}
          />
        </section>
        <section className="w-full md:w-3/5 flex flex-col gap-1">
          <VideoInfo
            video={videoInfo}
            onDownload={startDownload}
            onCancel={cancelDownload}
            onDelete={
              videoInfo
                ? () => {
                    const index = history.findIndex(
                      (v) => v.url === videoInfo.url
                    );
                    if (index !== -1) removeHistory(index);
                    setVideoInfo(null);
                  }
                : undefined
            }
            disabled={loading}
            status={status}
            progress={progress}
            downloadId={videoInfo?.downloadId}
          />

          {videoInfo && (
            <Gist
              video={videoInfo}
              disabled={loading}
              onGenerateTranscript={generateTranscript}
              onGenerateSummary={generateSummary}
            />
          )}
          {videoInfo && (
            <SentimentAnalysisPanel
              disabled={loading}
              sentimentData={videoInfo.sentimentData}
              onFetchSentimentAnalysis={() =>
                fetchSentimentAnalysis(videoInfo.url)
              }
            />
          )}
        </section>
      </main>
    </div>
  );
};

export default App;

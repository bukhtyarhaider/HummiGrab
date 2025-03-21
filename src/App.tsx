import React, { useState, useEffect, useCallback } from "react";
import axios, { AxiosError } from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import VideoInfo from "./components/VideoInfo";
import History from "./components/History";
import { ClipboardDocumentIcon } from "@heroicons/react/24/outline";

interface VideoFormat {
  format_id: string;
  label: string;
}

interface VideoEntry {
  url: string;
  title: string;
  thumbnail: string;
  duration?: number;
  video_formats?: VideoFormat[];
  downloaded: boolean;
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

  const BASE_URL = "http://0.0.0.0:5001";
  const PROGRESS_TIMEOUT = 30000; // 30 seconds

  // Load history from localStorage on mount
  useEffect(() => {
    const storedHistory = localStorage.getItem("videoHistory");
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
  }, []);

  const checkProgress = useCallback(async () => {
    if (!downloadId || status !== "downloading") return;

    console.log(`Checking progress for ${downloadId}`);
    try {
      const response = await axios.get(
        `${BASE_URL}/progress?download_id=${downloadId}`
      );
      const {
        progress,
        status: newStatus,
        error: backendError,
        filename,
      } = response.data;
      console.log("Progress response:", response.data);

      setProgress(progress);
      setStatus(newStatus);

      if (progress > 0 && progress < 100) {
        setLastProgressTime(Date.now());
      }

      if (newStatus === "completed") {
        console.log("Download completed, fetching file...");
        await downloadFile();
        updateDownloadStatus(true);
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
      console.error("Progress check error:", err.response?.data);
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
  }, [downloadId, status, lastProgressTime, videoInfo?.title]); // Dependencies are safe here

  // Poll progress with initial delay
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (downloadId && status === "downloading") {
      const timeout = setTimeout(() => {
        console.log(`Starting progress polling for ${downloadId}`);
        interval = setInterval(() => checkProgress(), 2000);
      }, 2000); // Wait 2 seconds before polling starts
      return () => {
        clearTimeout(timeout);
        if (interval) clearInterval(interval);
      };
    }
  }, [downloadId, status, checkProgress]); // checkProgress is now defined

  const fetchVideoInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${BASE_URL}/get_info`, { url });
      const data = response.data;
      const videoEntry: VideoEntry = {
        url,
        title: data.title,
        thumbnail: data.thumbnail,
        duration: data.duration,
        video_formats: data.video_formats,
        downloaded: false,
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
      });
      console.log("Start download response:", response.data);
      const { download_id } = response.data;
      if (!download_id) throw new Error("No download ID returned");

      setDownloadId(download_id);
      setStatus("downloading");
      setProgress(0);
      setLastProgressTime(Date.now());
    } catch (error) {
      const err = error as AxiosError;
      console.error("Start download error:", err.response?.data);
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
      const response = await axios.post(`${BASE_URL}/cancel_download`, {
        download_id: downloadId,
      });
      console.log("Cancel response:", response.data);
      setStatus("");
      setProgress(0);
      setDownloadId(null);
      toast.info("Download cancelled successfully", { position: "top-right" });
    } catch (error) {
      const err = error as AxiosError;
      console.error("Cancel download error:", err.response?.data);
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

    console.log(`Downloading file for ${downloadId}`);
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
      console.log("File downloaded successfully");
    } catch (error) {
      const err = error as AxiosError;
      console.error("Download error:", err.response?.data);
      setError("Failed to retrieve downloaded file");
      toast.error("Failed to retrieve downloaded file", {
        position: "top-right",
      });
    }
  };

  const updateDownloadStatus = (downloaded: boolean) => {
    if (!videoInfo) return;
    const updatedHistory = history.map((entry) =>
      entry.url === videoInfo.url ? { ...entry, downloaded } : entry
    );
    setHistory(updatedHistory);
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
      console.error("Failed to read clipboard:", err);
      toast.error("Failed to paste from clipboard", { position: "top-right" });
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

      <header className="p-4 w-full flex flex-wrap justify-center items-center gap-4">
        <img
          src="/src/assets/images/logo.png"
          alt="App Logo"
          className="w-24 h-auto"
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
            className="px-4 py-2 bg-gray-600 rounded transition duration-300 hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-500 focus:ring-opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap flex items-center justify-center gap-2"
            aria-label="Paste URL from clipboard"
          >
            <ClipboardDocumentIcon className="w-5 h-5" />
            Paste
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 rounded transition duration-300 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-blue-400 disabled:cursor-not-allowed whitespace-nowrap"
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

      <main className="flex flex-col md:flex-row w-full gap-4 p-4">
        <section className="w-full md:w-2/5">
          <History
            history={history}
            onVideoClick={(index) => setVideoInfo(history[index])}
            onRemove={removeHistory}
          />
        </section>
        <section className="w-full md:w-3/5 flex flex-col gap-4">
          <VideoInfo
            video={videoInfo}
            onDownload={startDownload}
            onCancel={cancelDownload} // Added cancel handler
            disabled={loading}
            status={status} // Pass status
            progress={progress} // Pass progress
          />
        </section>
      </main>
    </div>
  );
};

export default App;

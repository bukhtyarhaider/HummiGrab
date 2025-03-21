import React, { useState, useEffect } from "react";
import axios from "axios";
import VideoInfo from "./components/VideoInfo";
import History from "./components/History";
import ProgressBar from "./components/ProgressBar";

const App: React.FC = () => {
  const [url, setUrl] = useState<string>("");
  const [videoInfo, setVideoInfo] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [downloadId, setDownloadId] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<string>(""); // 'downloading', 'completed', or 'error'

  useEffect(() => {
    const storedHistory = localStorage.getItem("videoHistory");
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
  }, []);

  const BASE_URL = "http://127.0.0.1:5000"; // Backend API URL

  const fetchVideoInfo = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/get_info`, { url });
      setVideoInfo(response.data);
      const videoEntry = {
        url,
        title: response.data.title,
        thumbnail: response.data.thumbnail,
        duration: response.data.duration,
        video_formats: response.data.video_formats,
        downloaded: false,
      };
      const updatedHistory = [videoEntry, ...history];
      localStorage.setItem("videoHistory", JSON.stringify(updatedHistory));
      setHistory(updatedHistory);
    } catch (error) {
      alert("Error fetching video info");
    } finally {
      setLoading(false);
    }
  };

  const startDownload = async (formatId: string) => {
    console.log("video Info:", videoInfo.url);
    console.log("formate ID:", formatId);
    console.log("URL:", url);
    if (!formatId) {
      alert("Please select a video format to download");
      return;
    }
    try {
      const response = await axios.post(`${BASE_URL}/start_download`, {
        url: url ?? videoInfo.url,
        video_format_id: formatId,
      });
      setDownloadId(response.data.download_id);
      setStatus("downloading");
      setProgress(0);
    } catch (error) {
      alert("Error starting download");
    }
  };

  const checkProgress = async () => {
    if (!downloadId) return;
    try {
      const response = await axios.get(
        `${BASE_URL}/progress?download_id=${downloadId}`
      );
      const data = response.data;

      setProgress(data.progress);
      setStatus(data.status);

      if (data.status === "completed") {
        setStatus("completed");
        downloadFile();
      } else if (data.status === "error") {
        setStatus("error");
      }
    } catch (error) {
      console.error("Error checking progress:", error);
      setStatus("error");
    }
  };

  const downloadFile = () => {
    if (!downloadId) return;
    const link = document.createElement("a");
    link.href = `${BASE_URL}/get_file?download_id=${downloadId}`;
    link.download = "video.mp4";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleDownloadComplete = () => {
    // You can add more logic here, like updating history or notifying the user
    alert("Download completed!");
  };

  const removeHistory = (index: number) => {
    const updatedHistory = history.filter((_, i) => i !== index);
    localStorage.setItem("videoHistory", JSON.stringify(updatedHistory));
    setHistory(updatedHistory);
  };

  return (
    <div className="bg-gray-900 text-white p-6 w-full min-h-screen  ">
      <div className="flex mb-8 w-full justify-around flex-col md:flex-row items-center">
        <img
          src="/src/assets/images/logo.png"
          alt="Logo"
          className="w-32 h-auto"
        />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchVideoInfo();
          }}
          className="flex flex-col md:flex-row justify-between items-center gap-5 w-full max-w-xl"
        >
          <input
            type="text"
            placeholder="Enter YouTube URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className="w-full p-3 rounded mb-4 md:mb-0 bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="YouTube URL input"
          />
          <button
            type="submit"
            id="get-info-btn"
            className="px-6 py-3 bg-blue-600 w-auto min-w-[150px] max-w-[300px] rounded transition duration-300 ease-in-out transform hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 active:scale-95"
            aria-label="Get video information"
          >
            {loading ? "Loading..." : "Get Info"}
          </button>
        </form>
      </div>
      <div className="flex flex-col md:flex-row justify-center items-start">
        <History
          history={history}
          onVideoClick={(index) => {
            setVideoInfo(history[index]);
          }}
          onRemove={removeHistory}
        />
        <div className="flex justify-center items-center w-full md:max-w-4xl">
          <VideoInfo video={videoInfo} onDownload={startDownload} />

          <ProgressBar
            progress={progress}
            status={status}
            onDownloadComplete={handleDownloadComplete}
          />

          {status === "downloading" && (
            <button
              onClick={checkProgress}
              className="mt-4 px-6 py-3 bg-yellow-600 rounded"
            >
              Check Progress
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;

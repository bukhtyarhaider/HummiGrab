import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5001", // Your Flask backend
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
    allowedHosts: [
      "e7af-39-44-1-47.ngrok-free.app",
      "localhost", // Optional: if you need to allow localhost as well
      // "*" // You can use wildcard to allow all hosts, but be cautious
    ],
  },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: '/app/',
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom"],
  },
});

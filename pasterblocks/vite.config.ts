import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
  },
  define: {
    // Explicitly disable mobile detection
    global: 'globalThis',
    'process.env.MOBILE_WALLET_ADAPTER_PROTOCOL': 'false',
    'process.env.REACT_APP_NO_MOBILE_WALLET': 'true'
  }
});

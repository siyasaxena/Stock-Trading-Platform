import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  esbuild: {
    // This tells Vite's loader to parse JSX syntax inside .js files
    loader: "jsx",
    include: /src\/.*\.jsx$/,
    exclude: [],
  },
});

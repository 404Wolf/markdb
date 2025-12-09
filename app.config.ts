import { defineConfig } from "@solidjs/start/config";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  appRoot: "frontend",
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        lexical: path.resolve("node_modules/lexical"),
        "solid-js": path.resolve("node_modules/solid-js"),
      },
    },
  },
});
import { defineConfig } from "@solidjs/start/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  appRoot: "frontend",
  vite: {
    plugins: [tailwindcss()]
  }
});

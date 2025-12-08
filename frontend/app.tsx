import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense, createSignal, onMount } from "solid-js";
import { clientOnly } from "@solidjs/start";
import { getOrCreateDemoUser } from "~/lib/utils";
import { Toaster } from "solid-toast";
import "./app.css";

const DocumentSidebar = clientOnly(() => import("~/components/DocumentSidebar"));
const SchemaSidebar = clientOnly(() => import("~/components/SchemaSidebar"));

export default function App() {
  const [userId, setUserId] = createSignal<string>("");

  onMount(async () => {
    const user = await getOrCreateDemoUser();
    setUserId(user._id);
  });

  return (
    <Router
      root={props => (
        <div class="flex h-screen bg-[rgb(25,25,25)]">
          <Toaster position="top-right" />
          <Suspense fallback={<div class="w-16" />}>
            <DocumentSidebar userId={userId()} />
          </Suspense>
          <main class="flex-1 mx-auto text-gray-700">
            <Suspense>{props.children}</Suspense>
          </main>
          <Suspense fallback={<div class="w-16" />}>
            <SchemaSidebar />
          </Suspense>
        </div>
      )}
    >
      <FileRoutes />
    </Router>
  );
}

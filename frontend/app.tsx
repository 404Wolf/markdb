import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import { clientOnly } from "@solidjs/start";
import "./app.css";

const Sidebar = clientOnly(() => import("~/components/Sidebar"));
const RightSidebar = clientOnly(() => import("~/components/RightSidebar"));

export default function App() {
  return (
    <Router
      root={props => (
        <div class="flex h-screen bg-[rgb(25,25,25)]">
          <Sidebar />
          <main class="flex-1 mx-auto text-gray-700">
            <Suspense>{props.children}</Suspense>
          </main>
          <RightSidebar />
        </div>
      )}
    >
      <FileRoutes />
    </Router>
  );
}

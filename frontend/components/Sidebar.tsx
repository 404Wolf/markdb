import { createSignal, createResource, For } from "solid-js";
import { clientOnly } from "@solidjs/start";
import { useNavigate, useParams } from "@solidjs/router";
import { api } from "~/lib/api";

const File = clientOnly(() => import("lucide-solid/icons/file"));
const FileText = clientOnly(() => import("lucide-solid/icons/file-text"));

const fetchDocuments = async () => {
  const res = await api.documents.getAll();
  if (res.status === 200) return res.body;
  return [];
};

export const [refreshTrigger, setRefreshTrigger] = createSignal(0);

export default function Sidebar() {
  const [open, setOpen] = createSignal(false);
  const [documents] = createResource(refreshTrigger, fetchDocuments);
  const navigate = useNavigate();
  const params = useParams();

  return (
    <div class="flex h-full">
      <div class="p-2 text-white bg-[rgb(23,23,23)] border-r border-neutral-800 w-16">
        <button class="p-2 items-center h-10 w-10 mt-1 ml-1 rounded-md flex justify-center active:scale-95"
                onClick={() => setOpen(!open())}
        >
          <File class={open() ? "text-blue-400" : "text-white hover:text-blue-300"} />
        </button>
      </div>

      <div
        class={
          "text-white bg-[rgb(23,23,23)] border-r border-neutral-800 overflow-hidden transition-all duration-300 ease-in-out flex flex-col " +
          (open() ? "w-64 p-2" : "w-0")
        }
      >
        <div class="flex-1 overflow-y-auto">
          <For each={documents()}>
            {(doc) => (
              <button
                class={`flex items-center gap-2 w-full p-2 mt-1 mb-1 rounded text-left text-sm whitespace-nowrap active:scale-95 transition-transform duration-200 ${
                  params.id === doc._id
                    ? "bg-neutral-700 text-blue-400"
                    : "text-gray-400 hover:bg-neutral-700 hover:text-blue-400"
                }`}
                onClick={() => navigate(`/doc/${doc._id}`)}
              >
                <FileText class="w-4 h-4 flex-shrink-0" />
                <span class="truncate">{doc.name}</span>
              </button>
            )}
          </For>
        </div>
      </div>
    </div>
  );
}

import { createSignal, createResource, For } from "solid-js";
import { useParams } from "@solidjs/router";
import { clientOnly } from "@solidjs/start";
import { api } from "~/lib/api";

const FileBraces = clientOnly(() => import("lucide-solid/icons/file-braces"));
const FileCode = clientOnly(() => import("lucide-solid/icons/file-code"));

const fetchSchemas = async () => {
  const res = await api.schemas.getAll();
  if (res.status === 200) return res.body;
  return [];
};

export default function RightSidebar() {
  const [open, setOpen] = createSignal(false);
  const [schemas] = createResource(fetchSchemas);
  const params = useParams();

  const getCurrentSchemaId = async () => {
    if (!params.id) return null;
    const res = await api.documents.getById({ params: { id: params.id } });
    if (res.status === 200) return res.body.schemaId;
    return null;
  };

  const [currentSchemaId] = createResource(() => params.id, getCurrentSchemaId);

  return (
    <div class="flex h-full">
      <div
        class={
          "text-white bg-[rgb(23,23,23)] border-l border-neutral-800 overflow-hidden transition-all duration-300 ease-in-out flex flex-col " +
          (open() ? "w-64 p-2" : "w-0")
        }
      >
        <div class="flex-1 overflow-y-auto">
          <For each={schemas()}>
            {(schema) => (
              <div
                class={`flex items-center gap-2 w-full p-2 mt-1 mb-1 rounded text-sm whitespace-nowrap ${
                  currentSchemaId() === schema._id ? "bg-neutral-700 text-blue-400" : "text-gray-400"
                }`}
              >
                <FileCode class="w-4 h-4 flex-shrink-0" />
                <span class="truncate">{schema.name}</span>
              </div>
            )}
          </For>
        </div>
      </div>
      <div class="p-2 text-white bg-[rgb(23,23,23)] border-l border-neutral-800 w-16">
        <button class="p-2 items-center h-10 w-10 mt-1 ml-1 rounded-md flex justify-center active:scale-95"
          onClick={() => setOpen(!open())}
        >
          <FileBraces class={open() ? "text-blue-400" : "text-white hover:text-blue-300"} />
        </button>
      </div>
    </div>
  );
}
import { createSignal, createResource, For } from "solid-js";
import { useParams } from "@solidjs/router";
import { clientOnly } from "@solidjs/start";
import { clientApi } from "~/lib/api";

const FileBraces = clientOnly(() => import("lucide-solid/icons/file-braces"));
const FileCode = clientOnly(() => import("lucide-solid/icons/file-code"));

const fetchSchemas = async () => {
  const res = await clientApi.schemas.getAll();
  if (res.status === 200) return res.body;
  return [];
};

// Global signal for schema selection
export const [selectedSchemaInfo, setSelectedSchemaInfo] = createSignal<{
  schemaId: string;
  schemaContent: string;
} | null>(null);

// Global signal for current schema ID (for highlighting)
export const [currentSchemaId, setCurrentSchemaId] = createSignal<string>("");

export default function SchemaSidebar() {
  const [open, setOpen] = createSignal(false);
  const [schemas] = createResource(fetchSchemas);

  const handleSchemaClick = (schemaId: string, schemaContent: string) => {
    setSelectedSchemaInfo({ schemaId, schemaContent });
  };

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
              <button
                type="button"
                class={`flex items-center gap-2 w-full p-2 mt-1 mb-1 rounded text-left text-sm whitespace-nowrap active:scale-95 transition-transform duration-200 ${
                  currentSchemaId() === schema._id
                    ? "bg-neutral-700 text-blue-400"
                    : "text-gray-400 hover:bg-neutral-700 hover:text-blue-400"
                }`}
                onClick={() => handleSchemaClick(schema._id, schema.schema)}
              >
                <FileCode class="w-4 h-4 shrink-0" />
                <span class="truncate">{schema.name}</span>
              </button>
            )}
          </For>
        </div>
      </div>
      <div class="p-2 text-white bg-[rgb(23,23,23)] border-l border-neutral-800 w-16">
        <button
          type="button"
          class="p-2 items-center h-10 w-10 mt-1 ml-1 rounded-md flex justify-center active:scale-95"
          onClick={() => setOpen(!open())}
        >
          <FileBraces class={open() ? "text-blue-400" : "text-white hover:text-blue-300"} />
        </button>
      </div>
    </div>
  );
}

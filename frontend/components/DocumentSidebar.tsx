import { createSignal, createResource, For, Show } from "solid-js";
import { clientOnly } from "@solidjs/start";
import { useNavigate, useParams } from "@solidjs/router";
import { clientApi } from "~/lib/api";
import { getOrCreateBlankSchema } from "~/lib/utils";
import toast from "solid-toast";

const File = clientOnly(() => import("lucide-solid/icons/file"));
const FileText = clientOnly(() => import("lucide-solid/icons/file-text"));
const FilePlus = clientOnly(() => import("lucide-solid/icons/file-plus"));

const fetchDocuments = async () => {
  const res = await clientApi.documents.getAll();
  if (res.status === 200) return res.body;
  return [];
};

export const [refreshTrigger, setRefreshTrigger] = createSignal(0);

interface SidebarProps {
  userId?: string;
}

export default function DocumentSidebar(props: SidebarProps) {
  const [open, setOpen] = createSignal(false);
  const [documents] = createResource(refreshTrigger, fetchDocuments);
  const [isCreating, setIsCreating] = createSignal(false);
  const [newDocName, setNewDocName] = createSignal("");
  const navigate = useNavigate();
  const params = useParams();

  const handleCreateDocument = async () => {
    const name = newDocName().trim();
    if (!name || !props.userId) return;

    try {
      // Get or create blank schema
      const blankSchema = await getOrCreateBlankSchema();

      if (!blankSchema || !blankSchema._id) {
        toast.error("Failed to create blank schema");
        return;
      }

      // Create blank document with a single space to match the blank schema
      const res = await clientApi.documents.create({
        body: {
          name,
          schemaId: blankSchema._id,
          content: " ",
          author: props.userId,
          tags: []
        }
      });

      if (res.status === 201 && '_id' in res.body) {
        setRefreshTrigger(t => t + 1);
        setIsCreating(false);
        setNewDocName("");
        navigate(`/doc/${res.body._id}`);
        toast.success(`Document "${name}" created successfully`);
      } else if (res.status === 422) {
        toast.error("Validation error: Document content doesn't match schema");
      }
    } catch (error) {
      console.error("Error creating document:", error);
      toast.error(`Failed to create document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCreateDocument();
    } else if (e.key === "Escape") {
      setIsCreating(false);
      setNewDocName("");
    }
  };

  return (
    <div class="flex h-full">
      <div class="p-2 text-white bg-[rgb(23,23,23)] border-r border-neutral-800 w-16">
        <button type="button" class="p-2 items-center h-10 w-10 mt-1 ml-1 rounded-md flex justify-center active:scale-95"
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
                type="button"
                class={`flex items-center gap-2 w-full p-2 mt-1 mb-1 rounded text-left text-sm whitespace-nowrap active:scale-95 transition-transform duration-200 ${
                  params.id === doc._id
                    ? "bg-neutral-700 text-blue-400"
                    : "text-gray-400 hover:bg-neutral-700 hover:text-blue-400"
                }`}
                onClick={() => navigate(`/doc/${doc._id}`)}
              >
                <FileText class="w-4 h-4 shrink-0" />
                <span class="truncate">{doc.name}</span>
              </button>
            )}
          </For>

          <Show
            when={isCreating()}
            fallback={
              <button
                type="button"
                class="flex items-center gap-2 w-full p-2 mt-1 mb-1 rounded text-left text-sm whitespace-nowrap active:scale-95 transition-transform duration-200 text-gray-500 hover:bg-neutral-700 hover:text-gray-400"
                onClick={() => setIsCreating(true)}
              >
                <FilePlus class="w-4 h-4 shrink-0" />
                <span class="truncate">New document</span>
              </button>
            }
          >
            <div class="flex items-center gap-2 w-full p-2 mt-1 mb-1 rounded bg-neutral-700">
              <FileText class="w-4 h-4 shrink-0 text-blue-400" />
              <input
                type="text"
                class="flex-1 bg-transparent text-white text-sm outline-none"
                placeholder="Document name..."
                value={newDocName()}
                onInput={(e) => setNewDocName(e.currentTarget.value)}
                onKeyDown={handleKeyDown}
                autofocus
              />
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
}

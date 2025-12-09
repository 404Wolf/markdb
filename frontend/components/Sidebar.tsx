import { createSignal, createResource, For, Show } from "solid-js";
import { clientOnly } from "@solidjs/start";
import { useNavigate, useParams, useSearchParams } from "@solidjs/router";
import { clientApi } from "~/lib/api";

const File = clientOnly(() => import("lucide-solid/icons/file"));
const FileText = clientOnly(() => import("lucide-solid/icons/file-text"));
const TagIcon = clientOnly(() => import("lucide-solid/icons/tag"));
const XIcon = clientOnly(() => import("lucide-solid/icons/x"));
const PlusIcon = clientOnly(() => import("lucide-solid/icons/plus"));

const fetchDocuments = async (tagId?: string) => {
  const res = await clientApi.documents.getAll({ query: tagId ? { tagId } : undefined });
  if (res.status === 200) return res.body;
  return [];
};

const fetchTags = async () => {
  const res = await clientApi.tags.getAll();
  if (res.status === 200) return res.body;
  return [];
};

export const [refreshTrigger, setRefreshTrigger] = createSignal(0);

export default function Sidebar() {
  const [open, setOpen] = createSignal(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedTagId, setSelectedTagId] = createSignal<string | undefined>(searchParams?.tagId);
  const [showCreateTag, setShowCreateTag] = createSignal(false);
  const [newTagName, setNewTagName] = createSignal("");
  const [documents] = createResource(() => [refreshTrigger(), selectedTagId()] as const, ([_, tagId]) => fetchDocuments(tagId));
  const [tags] = createResource(refreshTrigger, fetchTags);
  const navigate = useNavigate();
  const params = useParams();

  const selectTag = (tagId: string) => {
    setSelectedTagId(tagId);
    setSearchParams({ tagId });
  };

  const clearTagFilter = () => {
    setSelectedTagId(undefined);
    setSearchParams({});
  };

  const createNewTag = async () => {
    if (!newTagName().trim()) return;

    try {
      const res = await clientApi.tags.create({
        body: { name: newTagName().trim() },
      });

      if (res.status === 201) {
        setRefreshTrigger((n) => n + 1);
        setNewTagName("");
        setShowCreateTag(false);
      } else {
        const err = res.body as { error?: string };
        alert("Error creating tag: " + (err.error || "Unknown error"));
      }
    } catch (e) {
      alert("Error: " + e);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      createNewTag();
    } else if (e.key === "Escape") {
      setNewTagName("");
      setShowCreateTag(false);
    }
  };

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
        <div class="mb-3 pb-3 border-b border-neutral-700">
          <div class="flex items-center justify-between mb-2 px-2">
            <div class="text-xs text-gray-400">Filter by tag:</div>
            <button
              type="button"
              class="inline-flex items-center gap-1 px-2 py-0.5 bg-zinc-700 hover:bg-zinc-600 text-gray-300 hover:text-white text-xs rounded transition-colors"
              onClick={() => setShowCreateTag(!showCreateTag())}
              title="Create new tag"
            >
              <PlusIcon size={10} />
              New
            </button>
          </div>
          
          <Show when={showCreateTag()}>
            <div class="flex items-center gap-1 mb-2 px-2">
              <input
                type="text"
                class="flex-1 bg-zinc-700 text-white px-2 py-1 text-xs rounded outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tag name..."
                value={newTagName()}
                onInput={(e) => setNewTagName(e.currentTarget.value)}
                onKeyDown={handleKeyDown}
                autofocus
              />
              <button
                type="button"
                class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                onClick={createNewTag}
                title="Create"
              >
                <PlusIcon size={12} />
              </button>
              <button
                type="button"
                class="px-2 py-1 bg-zinc-700 hover:bg-zinc-600 text-gray-300 text-xs rounded transition-colors"
                onClick={() => {
                  setNewTagName("");
                  setShowCreateTag(false);
                }}
                title="Cancel"
              >
                <XIcon size={12} />
              </button>
            </div>
          </Show>

          <div class="flex flex-wrap gap-1">
            <Show when={selectedTagId()}>
              <button
                type="button"
                class="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs rounded"
                onClick={clearTagFilter}
                title="Clear filter"
              >
                {tags()?.find(t => t._id === selectedTagId())?.name || "Tag"}
                <XIcon size={12} />
              </button>
            </Show>
            <Show when={!selectedTagId()}>
              <For each={tags()}>
                {(tag) => (
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 px-2 py-1 bg-zinc-700 hover:bg-blue-600 text-gray-300 hover:text-white text-xs rounded transition-colors"
                    onClick={() => selectTag(tag._id)}
                  >
                    <TagIcon size={10} />
                    {tag.name}
                  </button>
                )}
              </For>
            </Show>
          </div>
        </div>
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

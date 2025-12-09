import { createSignal, Show, createResource, For } from "solid-js";
import { clientOnly } from "@solidjs/start";
import { useNavigate } from "@solidjs/router";
import { clientApi } from "~/lib/api";
import { setRefreshTrigger } from "./DocumentSidebar";
import toast from "solid-toast";

const SaveIcon = clientOnly(() => import("lucide-solid/icons/save"));
const DeleteIcon = clientOnly(() => import("lucide-solid/icons/trash-2"));
const EditIcon = clientOnly(() => import("lucide-solid/icons/pencil"));
const TagIcon = clientOnly(() => import("lucide-solid/icons/tag"));
const XIcon = clientOnly(() => import("lucide-solid/icons/x"));

interface DocumentPropertiesProps {
  documentId?: string;
  initialName?: string;
  initialTags?: string[];
  onDelete?: () => void;
}

const fetchTags = async () => {
  const res = await clientApi.tags.getAll();
  if (res.status === 200) return res.body;
  return [];
};

export default function DocumentProperties(props: DocumentPropertiesProps) {
  const [documentName, setDocumentName] = createSignal(props.initialName || "Untitled Document");
  const [isEditing, setIsEditing] = createSignal(false);
  const [editValue, setEditValue] = createSignal(props.initialName || "Untitled Document");
  const [selectedTags, setSelectedTags] = createSignal<string[]>(props.initialTags || []);
  const [showTagSelector, setShowTagSelector] = createSignal(false);
  const [allTags] = createResource(fetchTags);
  const navigate = useNavigate();

  const handleSave = async () => {
    if (!props.documentId) {
      toast.error("No document to save");
      return;
    }

    const newName = editValue().trim();
    if (!newName) {
      toast.error("Document name cannot be empty");
      return;
    }

    try {
      const res = await clientApi.documents.update({
        params: { id: props.documentId },
        body: { name: newName },
      });

      if (res.status === 200) {
        setDocumentName(newName);
        setIsEditing(false);
        setRefreshTrigger((n) => n + 1);
        toast.success("Document name updated successfully");
      } else {
        const err = res.body as { error?: string };
        toast.error(`Error updating document: ${err.error || "Unknown error"}`);
      }
    } catch (e) {
      toast.error(`Error: ${e}`);
    }
  };

  const handleDelete = async () => {
    if (!props.documentId) {
      toast.error("No document to delete");
      return;
    }

    if (!confirm(`Delete "${documentName()}"?`)) return;

    try {
      const res = await clientApi.documents.delete({ params: { id: props.documentId } });
      if (res.status === 200) {
        setRefreshTrigger((n) => n + 1);
        navigate("/");
        props.onDelete?.();
        toast.success("Document deleted successfully");
      } else {
        toast.error("Error deleting document");
      }
    } catch (e) {
      toast.error(`Error: ${e}`);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setEditValue(documentName());
      setIsEditing(false);
    }
  };

  const toggleTag = async (tagId: string) => {
    if (!props.documentId) return;

    const newTags = selectedTags().includes(tagId)
      ? selectedTags().filter(id => id !== tagId)
      : [...selectedTags(), tagId];

    try {
      const res = await clientApi.documents.update({
        params: { id: props.documentId },
        body: { tags: newTags },
      });

      if (res.status === 200) {
        setSelectedTags(newTags);
        setRefreshTrigger((n) => n + 1);
      } else {
        toast.error(`Error updating tags: ${(res.body as { error?: string }).error || "Unknown error"}`);
      }
    } catch (e) {
      toast.error(`Error: ${e}`);
    }
  };

  const removeTag = async (tagId: string) => {
    await toggleTag(tagId);
  };

  return (
    <div class="flex flex-col gap-3 mb-4">
      <div class="flex items-center gap-2">
        <Show
          when={isEditing()}
          fallback={
            <div class="flex items-center gap-2 flex-1">
              <h2 class="text-xl font-semibold text-white">{documentName()}</h2>
              <Show when={props.documentId}>
                <button
                  type="button"
                  class="p-1 hover:bg-zinc-700 rounded text-gray-400 hover:text-white transition-colors"
                  onClick={() => setIsEditing(true)}
                  title="Edit name"
                >
                  <EditIcon size={16} />
                </button>
              </Show>
            </div>
          }
        >
          <div class="flex items-center gap-2 flex-1">
            <input
              type="text"
              class="flex-1 bg-zinc-700 text-white px-2 py-1 rounded outline-none focus:ring-2 focus:ring-blue-500"
              value={editValue()}
              onInput={(e) => setEditValue(e.currentTarget.value)}
              onKeyDown={handleKeyDown}
              autofocus
            />
            <button
              type="button"
              class="p-1 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors"
              onClick={handleSave}
              title="Save name"
            >
              <SaveIcon size={16} />
            </button>
            <button
              type="button"
              class="p-1 hover:bg-zinc-700 rounded text-gray-400 hover:text-white transition-colors"
              onClick={() => {
                setEditValue(documentName());
                setIsEditing(false);
              }}
              title="Cancel"
            >
              ×
            </button>
          </div>
        </Show>

        <Show when={props.documentId}>
          <button
            type="button"
            class="p-1 hover:bg-red-700 rounded text-gray-400 hover:text-red-400 transition-colors"
            onClick={handleDelete}
            title="Delete document"
          >
            <DeleteIcon size={16} />
          </button>
        </Show>
      </div>

      <Show when={props.documentId}>
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-2 flex-wrap">
            <For each={selectedTags()}>
              {(tagId) => {
                const tag = () => allTags()?.find(t => t._id === tagId);
                return (
                  <Show when={tag()}>
                    <span class="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs rounded">
                      {tag()!.name}
                      <button
                        type="button"
                        class="hover:bg-blue-700 rounded p-0.5 transition-colors"
                        onClick={() => removeTag(tagId)}
                        title="Remove tag"
                      >
                        <XIcon size={12} />
                      </button>
                    </span>
                  </Show>
                );
              }}
            </For>
            <button
              type="button"
              class="inline-flex items-center gap-1 px-2 py-1 bg-zinc-700 hover:bg-zinc-600 text-gray-300 text-xs rounded transition-colors"
              onClick={() => setShowTagSelector(!showTagSelector())}
              title="Add tag"
            >
              <TagIcon size={12} />
              Add Tag
            </button>
          </div>

          <Show when={showTagSelector()}>
            <div class="flex flex-wrap gap-2 p-2 bg-zinc-800 rounded border border-zinc-700">
              <For each={allTags()?.filter(tag => !selectedTags().includes(tag._id))}>
                {(tag) => (
                  <button
                    type="button"
                    class="px-2 py-1 bg-zinc-700 hover:bg-blue-600 text-gray-300 hover:text-white text-xs rounded transition-colors"
                    onClick={() => {
                      toggleTag(tag._id);
                      setShowTagSelector(false);
                    }}
                  >
                    {tag.name}
                  </button>
                )}
              </For>
              <Show when={!allTags()?.filter(tag => !selectedTags().includes(tag._id)).length}>
                <span class="text-xs text-gray-400">No more tags available</span>
              </Show>
            </div>
          </Show>
        </div>
      </Show>
    </div>
  );
}

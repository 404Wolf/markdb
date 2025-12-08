import { createSignal, Show } from "solid-js";
import { clientOnly } from "@solidjs/start";
import { useNavigate } from "@solidjs/router";
import { clientApi } from "~/lib/api";
import { setRefreshTrigger } from "./DocumentSidebar";
import toast from "solid-toast";

const SaveIcon = clientOnly(() => import("lucide-solid/icons/save"));
const DeleteIcon = clientOnly(() => import("lucide-solid/icons/trash-2"));
const EditIcon = clientOnly(() => import("lucide-solid/icons/pencil"));

interface DocumentPropertiesProps {
  documentId?: string;
  initialName?: string;
  onDelete?: () => void;
}

export default function DocumentProperties(props: DocumentPropertiesProps) {
  const [documentName, setDocumentName] = createSignal(props.initialName || "Untitled Document");
  const [isEditing, setIsEditing] = createSignal(false);
  const [editValue, setEditValue] = createSignal(props.initialName || "Untitled Document");
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
        toast.error("Error updating document: " + (err.error || "Unknown error"));
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

  return (
    <div class="flex items-center gap-2 mb-4">
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
  );
}

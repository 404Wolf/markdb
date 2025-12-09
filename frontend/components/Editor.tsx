import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { CodeNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { $convertToMarkdownString, $convertFromMarkdownString, TRANSFORMERS } from "@lexical/markdown";
import {
  ContentEditable,
  LexicalComposer,
  RichTextPlugin,
  LexicalErrorBoundary,
  LexicalMarkdownShortcutPlugin,
  OnChangePlugin,
  HorizontalRuleNode,
  ListPlugin,
  TabIndentationPlugin
} from "lexical-solid";
import { type EditorState } from "lexical";
import { useLexicalComposerContext } from "lexical-solid/LexicalComposerContext";
import { onMount } from "solid-js";
import { clientOnly } from "@solidjs/start";
import { createSignal, createEffect, Show, type Accessor } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { setRefreshTrigger } from "./DocumentSidebar";
import { clientApi } from "~/lib/api";
import DocumentProperties from "./DocumentProperties";
import toast from "solid-toast";
import { JsonView } from "@ryantipps/solid-json-view";

const Upload = clientOnly(() => import("lucide-solid/icons/upload"));
const Save = clientOnly(() => import("lucide-solid/icons/folder-check"));
const Delete = clientOnly(() => import("lucide-solid/icons/trash-2"));
const Code = clientOnly(() => import("lucide-solid/icons/code"));
const Eye = clientOnly(() => import("lucide-solid/icons/eye"));
const FileJson = clientOnly(() => import("lucide-solid/icons/file-json"));

interface EditorProps {
  onContentChange?: (content: string) => void;
  schema?: string;
  initialContent?: string;
  documentId?: string;
  documentName?: string;
  userId: string;
  isValid?: boolean | null;
  schemaId?: string;
}

function InitializePlugin(props: { content: Accessor<string> }) {
  const [editor] = useLexicalComposerContext();
  onMount(() => {
    editor.update(() => {
      $convertFromMarkdownString(props.content(), TRANSFORMERS);
    });
  });
  return null;
}

const DEFAULT_TEXT = `# Grocery List


- Apples
    - organic
- Blueberries`;

export default function Editor(props: EditorProps) {
  const [plaintext, setPlaintext] = createSignal(false);
  const [content, setContent] = createSignal(props.initialContent ?? DEFAULT_TEXT);
  const [hoverText, setHoverText] = createSignal("");
  const [showExtracted, setShowExtracted] = createSignal(false);
  const [extractedData, setExtractedData] = createSignal<any>(null);

  createEffect(() => {
    if (props.initialContent !== undefined) {
      setContent(props.initialContent);
      setPlaintext(true);
    }
  });

  const handleChange = (editorState: EditorState) => {
    editorState.read(() => {
      const markdown = $convertToMarkdownString(TRANSFORMERS);
      setContent(markdown);
      props.onContentChange?.(markdown);
    });
  };

  const handlePlaintextChange = (e: InputEvent) => {
    const value = (e.target as HTMLTextAreaElement).value;
    setContent(value);
    props.onContentChange?.(value);
  };

  let fileInputRef: HTMLInputElement | undefined;

  const handleUpload = () => {
    fileInputRef?.click();
  };

  const handleFileChange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setContent(text);
      props.onContentChange?.(text);
      setPlaintext(true);
    };
    reader.readAsText(file);
  };

  const navigate = useNavigate();

  const handleViewExtracted = async () => {
    if (!props.documentId) {
      toast.error("No document to view extracted data");
      return;
    }

    try {
      const res = await clientApi.documents.getById({ params: { id: props.documentId } });
      if (res.status === 200 && res.body.extracted) {
        setExtractedData(res.body.extracted);
        setShowExtracted(true);
      } else {
        toast.error("No extracted data available");
      }
    } catch (e) {
      toast.error(`Error fetching extracted data: ${e}`);
    }
  };

  const handleSave = async () => {
    if (!props.documentId) {
      toast.error("No document to save");
      return;
    }

    if (props.isValid !== true) {
      toast.error("Cannot save: Document does not validate against schema");
      return;
    }

    try {
      const updateBody: { content: string; schemaId?: string } = {
        content: content()
      };

      // Include schema ID if it's been changed
      if (props.schemaId) {
        updateBody.schemaId = props.schemaId;
      }

      const res = await clientApi.documents.update({
        params: { id: props.documentId },
        body: updateBody
      });

      if (res.status === 200) {
        toast.success("Document saved successfully!");
      } else if (res.status === 422) {
        toast.error("Validation error: Document content doesn't match schema");
      } else {
        toast.error("Error saving document");
      }
    } catch (e) {
      toast.error(`Error: ${e}`);
    }
  };

  const handleDelete = async () => {
    if (!props.documentId) {
      setContent(DEFAULT_TEXT);
      props.onContentChange?.(DEFAULT_TEXT);
      return;
    }

    if (!confirm("Delete this document?")) return;

    try {
      const res = await clientApi.documents.delete({ params: { id: props.documentId } });
      if (res.status === 200) {
        setRefreshTrigger((n) => n + 1);
        navigate("/");
        toast.success("Document deleted successfully");
      } else {
        toast.error("Error deleting document");
      }
    } catch (e) {
      toast.error(`Error: ${e}`);
    }
  };

  const initialConfig = {
    namespace: "MarkDB",
    onError: (error: Error) => console.error(error),
    nodes: [HorizontalRuleNode, HeadingNode, QuoteNode, ListNode, ListItemNode, CodeNode, LinkNode],
    theme: {
      heading: {
        h1: "text-3xl font-bold",
        h2: "text-2xl font-bold",
        h3: "text-xl font-bold",
      },
      quote: "border-l-4 border-gray-500 pl-4 italic",
      list: {
        ul: "ml-6",
        ol: "list-decimal ml-6",
        listitem: "list-disc",
        nested: {
          listitem: "list-none ml-1",
        },
      },
      code: "bg-zinc-700 px-1 rounded font-mono",
      link: "text-blue-400 underline",
    },
  };

  return (
    <div class="relative bg-neutral-800 rounded-lg p-4 flex flex-col h-full">
      <DocumentProperties
        documentId={props.documentId}
        initialName={props.documentName}
        onDelete={() => {
          setContent(DEFAULT_TEXT);
          props.onContentChange?.(DEFAULT_TEXT);
        }}
      />
      <div class="text-xs text-gray-500 mb-2">Markdown</div>

      <Show
        when={!plaintext()}
        fallback={
          <textarea
            class="flex-1 bg-transparent text-white outline-none font-mono text-sm resize-none"
            value={content()}
            onInput={handlePlaintextChange}
            placeholder="# Start typing markdown..."
            spellcheck={false}
          />
        }
      >
        <LexicalComposer initialConfig={initialConfig}>
          <RichTextPlugin
            contentEditable={<ContentEditable class="flex-1 overflow-y-auto text-white outline-none" />}
            placeholder={<div class="absolute top-10 left-4 text-gray-500 pointer-events-none">Start typing...</div>}
            errorBoundary={LexicalErrorBoundary}
          />
          <LexicalMarkdownShortcutPlugin />
          <ListPlugin />
          <TabIndentationPlugin />
          <OnChangePlugin onChange={handleChange} />
          <InitializePlugin content={content} />
        </LexicalComposer>
      </Show>

      <div class="h-5 mt-4 text-xs text-gray-400">{hoverText()}</div>

      <div class="flex gap-2 mt-4 justify-start">
        <button
          type="button"
          class="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 rounded text-sm text-white active:scale-95"
          onClick={() => setPlaintext(!plaintext())}
          onMouseEnter={() => setHoverText(plaintext() ? "Switch to formatted view" : "Switch to plaintext view")}
          onMouseLeave={() => setHoverText("")}
        >
          <Show when={plaintext()} fallback={<Code />}>
            <Eye />
          </Show>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.markdown,.txt"
          class="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          class="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 rounded text-sm text-white active:scale-95"
          onClick={handleUpload}
          onMouseEnter={() => setHoverText("Upload document")}
          onMouseLeave={() => setHoverText("")}
        >
          <Upload />
        </button>
        <button
          type="button"
          class="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 rounded text-sm text-white active:scale-95"
          onClick={handleViewExtracted}
          onMouseEnter={() => setHoverText("View extracted data")}
          onMouseLeave={() => setHoverText("")}
        >
          <FileJson />
        </button>
        <button
          type="button"
          class={`px-3 py-1 rounded text-sm text-white transition-all ${
            props.isValid === true
              ? "bg-green-600 hover:bg-green-500 active:scale-95"
              : "bg-zinc-700 opacity-50 cursor-not-allowed"
          }`}
          onClick={handleSave}
          disabled={props.isValid !== true}
          onMouseEnter={() =>
            setHoverText(
              props.isValid === true
                ? "Save document"
                : props.isValid === false
                ? "Cannot save: validation failed"
                : "Cannot save: no validation result"
            )
          }
          onMouseLeave={() => setHoverText("")}
        >
          <Save />
        </button>
        <button
          type="button"
          class="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 rounded text-sm text-white active:scale-95"
          onClick={handleDelete}
          onMouseEnter={() => setHoverText("Delete document")}
          onMouseLeave={() => setHoverText("")}
        >
          <Delete />
        </button>
      </div>

      {/* Extracted Data Modal */}
      <Show when={showExtracted()}>
        <button
          type="button"
          class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowExtracted(false)}
        >
          <button
            type="button"
            class="bg-neutral-800 rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-semibold text-white">Extracted Data</h2>
              <button
                type="button"
                class="text-gray-400 hover:text-white text-2xl"
                onClick={() => setShowExtracted(false)}
              >
                ×
              </button>
            </div>
            <pre class="text-white font-mono text-sm bg-neutral-900 p-4 rounded overflow-auto">
              {JSON.stringify(extractedData(), null, 2)}
            </pre>
          </button>
        </button>
      </Show>
    </div>
  );
}

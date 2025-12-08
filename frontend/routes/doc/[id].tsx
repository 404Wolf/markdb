import { createSignal, createResource, Show } from "solid-js";
import { useParams } from "@solidjs/router";
import { clientOnly } from "@solidjs/start";
import { api } from "~/lib/api";

const Editor = clientOnly(() => import("~/components/Editor"));
const SchemaEditor = clientOnly(() => import("~/components/SchemaEditor"));

export default function DocumentPage() {
  const params = useParams();
  const [isValid, setIsValid] = createSignal<boolean | null>(null);
  const [markdown, setMarkdown] = createSignal("");
  const [schema, setSchema] = createSignal("");
  const [leftWidth, setLeftWidth] = createSignal(50);
  let containerRef: HTMLDivElement | undefined;

  const [doc] = createResource(
    () => params.id,
    async (id) => {
      const res = await api.documents.getById({ params: { id } });
      if (res.status === 200) return res.body;
      return null;
    }
  );

  const [schemaContent] = createResource(
    () => doc()?.schemaId,
    async (schemaId) => {
      if (!schemaId) return null;
      const res = await api.schemas.getById({ params: { id: schemaId } });
      if (res.status === 200) return res.body.schema;
      return null;
    }
  );

  const handleMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = leftWidth();

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef) return;
      const containerWidth = containerRef.offsetWidth;
      const delta = e.clientX - startX;
      const newWidth = startWidth + (delta / containerWidth) * 100;
      setLeftWidth(Math.min(Math.max(newWidth, 20), 80));
    };

    const handleMouseUp = () => {
      window.document.removeEventListener("mousemove", handleMouseMove);
      window.document.removeEventListener("mouseup", handleMouseUp);
    };

    window.document.addEventListener("mousemove", handleMouseMove);
    window.document.addEventListener("mouseup", handleMouseUp);
  };

  let debounceTimer: ReturnType<typeof setTimeout>;

  const runValidation = async (md: string, sch: string) => {
    if (!md || !sch) {
      setIsValid(null);
      return;
    }
    try {
      const result = await api.validate({ body: { input: md, schema: sch } });
      if (result.status === 200) {
        setIsValid(result.body.success);
      } else {
        setIsValid(null);
      }
    } catch {
      setIsValid(null);
    }
  };

  const handleMarkdownChange = (content: string) => {
    setMarkdown(content);
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => runValidation(content, schema()), 500);
  };

  const handleSchemaChange = (content: string) => {
    setSchema(content);
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => runValidation(markdown(), content), 500);
  };

  return (
    <div class="flex flex-col h-[calc(100vh-2rem)] m-4">
      <Show when={doc()} fallback={<div class="text-gray-500">Loading...</div>}>
        <div ref={containerRef} class="flex flex-1 gap-0">
          <div style={{ width: `${leftWidth()}%` }}>
            <Editor
              onContentChange={handleMarkdownChange}
              schema={schema()}
              initialContent={doc()?.content}
              documentId={doc()?._id}
            />
          </div>

          <div
            onMouseDown={handleMouseDown}
            class={`w-1 mx-2 rounded cursor-col-resize transition-colors duration-300 ${
              isValid() === null
                ? "bg-neutral-600"
                : isValid()
                ? "bg-green-500"
                : "bg-red-500"
            }`}
          />

          <div style={{ width: `${100 - leftWidth()}%` }}>
            <SchemaEditor onSchemaChange={handleSchemaChange} initialContent={schemaContent() ?? undefined} />
          </div>
        </div>
      </Show>

      <div class="text-sm text-gray-500 text-center mt-3">
        <p>markdb v0.0.0</p>
      </div>
    </div>
  );
}

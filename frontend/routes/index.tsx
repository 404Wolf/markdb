import { createSignal, onMount } from "solid-js";
import { clientOnly } from "@solidjs/start";
import { getOrCreateDemoUser } from "~/lib/utils";

const Editor = clientOnly(() => import("~/components/Editor"));
const SchemaEditor = clientOnly(() => import("~/components/SchemaEditor"));

export default function Home() {
  const [isValid, setIsValid] = createSignal<boolean | null>(null);
  const [markdown, setMarkdown] = createSignal("");
  const [schema, setSchema] = createSignal("");
  const [leftWidth, setLeftWidth] = createSignal(50);
  let containerRef: HTMLDivElement | undefined;

  const [user, setUser] = createSignal<{ _id: string; email: string; name: string } | null>(null);

  onMount(async () => {
    const userData = await getOrCreateDemoUser();
    setUser(userData);
  });

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
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  let debounceTimer: ReturnType<typeof setTimeout>;

  const runValidation = async (md: string, sch: string) => {
    if (!md || !sch) {
      setIsValid(null);
      return;
    }
    try {
      const result = await clientApi.validate({ body: { input: md, schema: sch } });
      console.log(result.body);
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
    console.log("markdown changed:", content);
    console.log("raw content:", JSON.stringify(content));
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
      <div ref={containerRef} class="flex flex-1 gap-0">
        <div style={{ width: `${leftWidth()}%` }}>
          <Editor onContentChange={handleMarkdownChange} schema={schema()} userId={user()?._id || ""} />
        </div>

        <button
          type="button"
          onMouseDown={handleMouseDown}
          class={`w-1 mx-2 rounded cursor-col-resize transition-colors duration-300 ${isValid() === null
            ? "bg-neutral-600"
            : isValid()
              ? "bg-green-500"
              : "bg-red-500"
            }`}
          aria-label="Resize panels"
        />

        <div style={{ width: `${100 - leftWidth()}%` }}>
          <SchemaEditor onSchemaChange={handleSchemaChange} />
        </div>
      </div>

      <div>
        <div class="text-sm text-gray-500 text-center mt-3">
          <p>MarkDB v0.0.0</p>
        </div>
        <div class="absolute right-4 bottom-4 text-sm text-gray-500">
          <div>Email: {user()?.email}</div>
          <div>Name: {user()?.name}</div>
          <div>Id: {user()?._id}</div>
        </div>
      </div>
    </div>
  );
}

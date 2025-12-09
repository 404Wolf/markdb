import { createSignal, createEffect, onMount } from "solid-js";

interface SchemaEditorProps {
  onSchemaChange?: (schema: string) => void;
  initialContent?: string;
}

const DEFAULT_SCHEMA = `# Grocery List

- \`item:/\\w+/\`++
  - \`note:/\\w+/\`+`;

export default function SchemaEditor(props: SchemaEditorProps) {
  const [content, setContent] = createSignal(DEFAULT_SCHEMA);

  createEffect(() => {
    if (props.initialContent) {
      setContent(props.initialContent);
      props.onSchemaChange?.(props.initialContent);
    }
  });

  const handleInput = (e: InputEvent) => {
    const value = (e.target as HTMLTextAreaElement).value;
    setContent(value);
    props.onSchemaChange?.(value);
  };

  return (
    <div class="relative bg-neutral-800 rounded-lg p-4 flex flex-col h-full">
      <div class="text-xs text-gray-500 mb-2">Schema</div>
      <textarea
        class="flex-1 bg-transparent text-white outline-none font-mono text-sm resize-none"
        value={content()}
        onInput={handleInput}
        placeholder='{ "type": "object", ... }'
        spellcheck={false}
      />
    </div>
  );
}

import { buildCommand } from "@stricli/core";

export const addCommand = buildCommand({
  loader: async () => {
    const { add } = await import("./impl");
    return add;
  },
  parameters: {
    flags: {
      a: {
        kind: "parsed",
        parse: Number,
        brief: "First number",
      },
      b: {
        kind: "parsed",
        parse: Number,
        brief: "Second number",
      },
    },
    positional: {
      kind: "tuple",
      parameters: [],
    },
  },
  docs: {
    brief: "Add two numbers",
  },
});

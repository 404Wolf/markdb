import type { LocalContext } from "../../context";

interface AddCommandFlags {
  a: number;
  b: number;
}

export async function add(this: LocalContext, flags: AddCommandFlags): Promise<void> {
  const result = flags.a + flags.b;
  console.log(result);
}

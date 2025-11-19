export async function validate(input: string): Promise<string> {
  const proc = Bun.spawn(["mdv", "-", "schema.md"], {
    stdin: "pipe",
    stdout: "pipe",
    stderr: "pipe",
  });

  proc.stdin.write(input);
  proc.stdin.end();

  const output = await new Response(proc.stdout).text();
  await proc.exited;

  return output;
}

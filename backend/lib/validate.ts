import * as fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { ExecaError, execa } from "execa";

export const MDV_PATH = os.homedir() + "/.cargo/bin/mdv";

export interface ValidateParams {
  input: string;
  schema: string;
}

export type ValidateResult =
  | {
    success: true;
    /** Extracted mdvalidate output */
    output: object;
  }
  | {
    success: false;
    /** For now, the raw stderr output from mdvalidate */
    error: string;
  };

/**
 * Run `mdvalidate` with some markdown file and input schema
 */
export async function validate({
  input,
  schema,
}: ValidateParams): Promise<ValidateResult> {
  let schemaDir: string | undefined;

  try {
    schemaDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "mdv-schema-"),
    );
    const schemaFile = path.join(schemaDir, "schema.json");

    await fs.writeFile(schemaFile, schema, "utf8");

    const result = await execa(MDV_PATH, [schemaFile, "-", "-"], {
      input,
    });

    return {
      success: true,
      output: JSON.parse(result.stdout),
    };
  } catch (e: unknown) {
    if (e instanceof ExecaError) {
      return {
        success: false,
        error: e.stderr || e.stdout || e.message,
      };
    } else {
      return {
        success: false,
        error: String(e),
      };
    }
  } finally {
    if (schemaDir) {
      try {
        await fs.rm(schemaDir, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
    }
  }
}

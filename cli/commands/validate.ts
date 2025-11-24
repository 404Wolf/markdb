import { buildCommand, type CommandContext } from "@stricli/core";
import * as fs from "node:fs/promises";
import { client } from "../client";

export const validateCommand = buildCommand({
  async func(this: CommandContext, _: {}, schemaPath: string, inputPath: string) {
    let inputStr: string;
    if (inputPath === '-') {
      inputStr = await new Promise<string>((resolve, reject) => {
        let data = '';
        process.stdin.setEncoding('utf8');
        process.stdin.on('data', (chunk) => {
          data += chunk;
        });
        process.stdin.on('end', () => {
          resolve(data);
        });
        process.stdin.on('error', reject);
      });
    } else {
      inputStr = await fs.readFile(inputPath, "utf8");
    }

    const schemaStr = await fs.readFile(schemaPath, "utf8");

    try {
      const response = await client.validate({
        body: {
          input: inputStr,
          schema: schemaStr,
        },
      });

      console.error(`Response status: ${response.status}`);
      console.error(`Response body:`, response.body);

      if (response.status === 200) {
        console.log(JSON.stringify(response.body.output, null, 2));
      } else if (response.status === 400) {
        console.error(`Error: ${response.body.error}`);
        process.exit(1);
      } else {
        console.error(`Unexpected error: ${response.status}`);
        process.exit(1);
      }
    } catch (error) {
      console.error('Request failed:', error);
      process.exit(1);
    }
  },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [
        {
          brief: "Path to schema file",
          parse: String,
        },
        {
          brief: "Path to input file or '-' for stdin",
          parse: String,
        },
      ],
    },
  },
  docs: {
    brief: "Validate input against schema using mdvalidate",
  },
});

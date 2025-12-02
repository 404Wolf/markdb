import { buildCommand, type CommandContext } from "@stricli/core";
import chalk from "chalk";
import * as fs from "node:fs/promises";
import { client } from "../client";
import { InputData } from "../lib/InputData";

export const validateCommand = buildCommand({
  async func(this: CommandContext, _: Record<string, never>, schemaPath: string, inputPath: string) {
    const inputData = new InputData(inputPath);

    const inputStr = await inputData.read();
    const schemaStr = await fs.readFile(schemaPath, "utf8");

    try {
      const response = await client.validate({
        body: {
          input: inputStr,
          schema: schemaStr,
        },
      });

      console.error(chalk.dim(`Response status: ${response.status}`));

      if (response.status === 200) {
        console.log(chalk.green('Validation successful'));
        console.log(JSON.stringify(response.body.output, null, 2));
      } else if (response.status === 400) {
        console.error(chalk.red('Validation failed'));
        console.error(chalk.red(`Error: ${response.body.error}`));
        process.exit(1);
      } else {
        console.error(chalk.red(`Unexpected error: ${response.status}`));
        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red('Request failed:'), error);
      process.exit(1);
    }
  },
  parameters: {
    flags: {},
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

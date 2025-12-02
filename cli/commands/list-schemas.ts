import { buildCommand, type CommandContext } from "@stricli/core";
import chalk from "chalk";
import { client } from "../client";

export const listSchemasCommand = buildCommand({
  async func(this: CommandContext) {
    try {
      const response = await client.schemas.getAll();

      console.error(chalk.dim(`Response status: ${response.status}`));

      if (response.status === 200) {
        if (response.body.length === 0) {
          console.log(chalk.yellow('No schemas found'));
          return;
        }

        console.log(chalk.green(`Found ${response.body.length} schema(s):\n`));
        
        for (const schema of response.body) {
          console.log(chalk.bold(`${schema.name}`));
          console.log(chalk.dim(`  ID: ${schema._id}`));
          console.log(chalk.dim(`  Created: ${new Date(schema.createdAt).toLocaleString()}`));
          console.log();
        }
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
      parameters: [],
    },
  },
  docs: {
    brief: "List all schemas",
  },
});

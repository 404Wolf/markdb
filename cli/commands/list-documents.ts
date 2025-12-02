import { buildCommand, type CommandContext } from "@stricli/core";
import chalk from "chalk";
import { client } from "../client";

export const listDocumentsCommand = buildCommand({
  async func(this: CommandContext) {
    try {
      const response = await client.documents.getAll();

      console.error(chalk.dim(`Response status: ${response.status}`));

      if (response.status === 200) {
        if (response.body.length === 0) {
          console.log(chalk.yellow('No documents found'));
          return;
        }

        console.log(chalk.green(`Found ${response.body.length} document(s):\n`));
        
        for (const doc of response.body) {
          console.log(chalk.bold(`${doc.name}`));
          console.log(chalk.dim(`  ID: ${doc._id}`));
          console.log(chalk.dim(`  Author: ${doc.author}`));
          console.log(chalk.dim(`  Tags: ${doc.tags.length > 0 ? doc.tags.join(', ') : 'none'}`));
          console.log(chalk.dim(`  Created: ${new Date(doc.createdAt).toLocaleString()}`));
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
    brief: "List all documents",
  },
});

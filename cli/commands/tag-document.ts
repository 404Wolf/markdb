import { buildCommand, type CommandContext } from "@stricli/core";
import chalk from "chalk";
import { client } from "../client";

export const tagDocumentCommand = buildCommand({
  async func(this: CommandContext, flags: { add?: string[]; remove?: string[] }, documentId: string) {
    try {
      // First, get the current document to see its tags
      const getResponse = await client.documents.getById({ params: { id: documentId } });

      if (getResponse.status === 404) {
        console.error(chalk.red('Document not found'));
        process.exit(1);
      } else if (getResponse.status !== 200) {
        console.error(chalk.red(`Unexpected error: ${getResponse.status}`));
        process.exit(1);
      }

      const currentTags = new Set(getResponse.body.tags);
      
      // Add new tags
      if (flags.add) {
        for (const tag of flags.add) {
          currentTags.add(tag);
        }
      }

      // Remove tags
      if (flags.remove) {
        for (const tag of flags.remove) {
          currentTags.delete(tag);
        }
      }

      // Update the document with new tags
      const updateResponse = await client.documents.update({
        params: { id: documentId },
        body: {
          tags: Array.from(currentTags),
        },
      });

      if (updateResponse.status === 200) {
        console.log(chalk.green('Document tags updated successfully'));
        console.log(chalk.bold(updateResponse.body.name));
        console.log(chalk.dim(`Tags: ${updateResponse.body.tags.length > 0 ? updateResponse.body.tags.join(', ') : 'none'}`));
      } else if (updateResponse.status === 404) {
        console.error(chalk.red('Document not found'));
        process.exit(1);
      } else {
        console.error(chalk.red(`Unexpected error: ${updateResponse.status}`));
        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red('Request failed:'), error);
      process.exit(1);
    }
  },
  parameters: {
    flags: {
      add: {
        kind: "parsed",
        parse: String,
        brief: "Add tags to the document",
        variadic: true,
      },
      remove: {
        kind: "parsed",
        parse: String,
        brief: "Remove tags from the document",
        variadic: true,
      },
    },
    positional: {
      kind: "tuple",
      parameters: [
        {
          brief: "Document ID to tag",
          parse: String,
        },
      ],
    },
  },
  docs: {
    brief: "Add or remove tags from a document",
  },
});

import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core";
import chalk from "chalk";
import { client } from "../client";

const wipeCommand = buildCommand({
  async func(this: CommandContext, _: Record<string, never>, password: string) {
    try {
      console.log(chalk.yellow('⚠️  WARNING: This will delete ALL data from the database!'));
      
      const response = await client.admin.wipeDatabase({ 
        body: { password } 
      });

      if (response.status === 200) {
        console.log(chalk.green('✓ Database wiped successfully'));
        console.log(chalk.dim('\nDeleted counts:'));
        console.log(chalk.dim(`  Users: ${response.body.deletedCounts.users}`));
        console.log(chalk.dim(`  Schemas: ${response.body.deletedCounts.schemas}`));
        console.log(chalk.dim(`  Documents: ${response.body.deletedCounts.documents}`));
        console.log(chalk.dim(`  Tags: ${response.body.deletedCounts.tags}`));
        console.log(chalk.dim(`  Extracted: ${response.body.deletedCounts.extracted}`));
      } else if (response.status === 401) {
        console.error(chalk.red('Invalid admin password'));
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
          brief: "Admin password",
          parse: String,
        },
      ],
    },
  },
  docs: {
    brief: "Wipe all data from the database",
  },
});

export const adminCommand = buildRouteMap({
  routes: {
    wipe: wipeCommand,
  },
  docs: {
    brief: "Admin operations",
  },
});

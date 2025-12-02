import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core";
import chalk from "chalk";
import { client } from "../client";
import { userStorage } from "../lib/userStorage";

const loginCommand = buildCommand({
  async func(this: CommandContext, _: Record<string, never>, email: string, password: string) {
    try {
      const response = await client.users.login({ 
        body: { 
          email, 
          password 
        } 
      });

      if (response.status === 200) {
        await userStorage.setUser(response.body);
        console.log(chalk.green('Login successful'));
        console.log(chalk.dim(`Name: ${response.body.name}`));
        console.log(chalk.dim(`Email: ${response.body.email}`));
      } else if (response.status === 401) {
        console.error(chalk.red('Invalid email or password'));
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
          brief: "Email address",
          parse: String,
        },
        {
          brief: "Password",
          parse: String,
        },
      ],
    },
  },
  docs: {
    brief: "Login with email and password",
  },
});

const getUserCommand = buildCommand({
  async func(this: CommandContext) {
    const user = await userStorage.getUser();

    if (!user) {
      console.log(chalk.yellow('No user set'));
      console.log(chalk.dim('Use "markdb user set <userId>" to set a user'));
      return;
    }

    console.log(chalk.green('Current user:'));
    console.log(chalk.bold(user.name));
    console.log(chalk.dim(`ID: ${user._id}`));
    console.log(chalk.dim(`Email: ${user.email}`));
  },
  parameters: {
    flags: {},
    positional: {
      kind: "tuple",
      parameters: [],
    },
  },
  docs: {
    brief: "Get the current user",
  },
});

const clearUserCommand = buildCommand({
  async func(this: CommandContext) {
    await userStorage.clearUser();
    console.log(chalk.green('User cleared successfully'));
  },
  parameters: {
    flags: {},
    positional: {
      kind: "tuple",
      parameters: [],
    },
  },
  docs: {
    brief: "Clear the current user",
  },
});

export const userCommand = buildRouteMap({
  routes: {
    login: loginCommand,
    get: getUserCommand,
    clear: clearUserCommand,
  },
  docs: {
    brief: "Manage the current user",
  },
});

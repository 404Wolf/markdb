import { buildApplication, buildRouteMap } from "@stricli/core";
import { name } from "../package.json";
import { addCommand } from "./commands/nested/commands";

const routes = buildRouteMap({
  routes: {
    add: addCommand,
  },
  docs: {
    brief: "Simple calculator CLI",
  },
});

export const app = buildApplication(routes, {
  name,
  versionInfo: {
    // currentVersion: version,
    currentVersion: "0.0.0", // TODO: add version
  },
});

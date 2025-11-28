import { buildApplication, buildRouteMap } from "@stricli/core";
import { name } from "../package.json";
import { validateCommand } from "./commands/validate";

const routes = buildRouteMap({
  routes: {
    validate: validateCommand,
  },
  docs: {
    brief: "MarkDB CLI",
  },
});

export const app = buildApplication(routes, {
  name,
  versionInfo: {
    // currentVersion: version,
    currentVersion: "0.0.0", // TODO: add version
  },
});

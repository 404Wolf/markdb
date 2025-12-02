import { buildApplication, buildRouteMap } from "@stricli/core";
import { name } from "../package.json";
import { validateCommand } from "./commands/validate";
import { userCommand } from "./commands/user";
import { listSchemasCommand } from "./commands/list-schemas";
import { listDocumentsCommand } from "./commands/list-documents";
import { tagDocumentCommand } from "./commands/tag-document";
import { adminCommand } from "./commands/admin";

const routes = buildRouteMap({
  routes: {
    validate: validateCommand,
    user: userCommand,
    "list-schemas": listSchemasCommand,
    "list-documents": listDocumentsCommand,
    "tag-document": tagDocumentCommand,
    admin: adminCommand,
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

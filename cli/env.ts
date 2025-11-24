import { envsafe, url } from "envsafe";

export const env = envsafe({
  MARKDB_BASE_URL: url({
    default: "http://localhost:3001",
    allowEmpty: true,
  }),
});

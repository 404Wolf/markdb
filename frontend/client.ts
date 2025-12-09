import { initClient } from '@ts-rest/core';
import { contract } from '../backend/contracts';
import { envsafe, url } from "envsafe";

const env = envsafe({
  MARKDB_BASE_URL: url({
    default: "http://localhost:3001",
    allowEmpty: true,
  }),
});

export const client = initClient(contract, {
  baseUrl: env.MARKDB_BASE_URL,
  baseHeaders: {},
});

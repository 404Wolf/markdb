import { initClient } from "@ts-rest/core";
import { contract } from "../../backend/contracts";

export const api = initClient(contract, {
  baseUrl: "http://localhost:3001",
  baseHeaders: {},
});

import { initClient } from "@ts-rest/core";
import { contract } from "../../backend/contracts";

export const clientApi = initClient(contract, {
  baseUrl: "http://localhost:3001",
  baseHeaders: {},
});

export const serverApi = initClient(contract, {
  baseUrl: "http://backend:3001",
  baseHeaders: {},
});

import { initClient } from '@ts-rest/core';
import { contract } from '../backend/contracts';
import { env } from './env';

export const client = initClient(contract, {
  baseUrl: env.MARKDB_BASE_URL,
  baseHeaders: {},
});

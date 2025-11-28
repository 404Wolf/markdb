import { initContract } from '@ts-rest/core';
import { validateContract } from './validate';

const c = initContract();

export const contract = c.router({
  validate: validateContract.validate,
});

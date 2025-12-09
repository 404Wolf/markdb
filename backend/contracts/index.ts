import { initContract } from '@ts-rest/core';
import { validateContract } from './validate';
import { usersContract } from './users';
import { schemasContract } from './schemas';
import { documentsContract } from './documents';
import { tagsContract } from './tags';
import { adminContract } from './admin';

const c = initContract();

export const contract = c.router({
  validate: validateContract.validate,
  users: usersContract,
  schemas: schemasContract,
  documents: documentsContract,
  tags: tagsContract,
  admin: adminContract,
});

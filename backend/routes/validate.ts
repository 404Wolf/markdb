import { validateContract } from '../contracts/validate';
import { validate } from '../lib/validate';
import { s } from "../tsrest"
export const validateRouter = s.router(validateContract, {
  validate: async ({ body: { input, schema } }) => {
    const result = await validate({ input, schema });

    return {
      status: 200,
      body: result,
    };
  },
});

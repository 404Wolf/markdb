import { validateContract } from '../contracts/validate';
import { validate } from '../lib/validate';
import { s } from "../tsrest"

export const validateRouter = s.router(validateContract, {
  validate: async ({ body: { input, schema } }) => {
    const result = await validate({ input, schema });

    if (result.success) {
      return {
        status: 200,
        body: result,
      };
    } else {
      return {
        status: 400,
        body: result,
      };
    }
  },
});

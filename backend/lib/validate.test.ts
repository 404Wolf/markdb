import { describe, expect, it } from "vitest";
import { validate } from "./validate";

describe('validate', () => {
  it('should validate successfully', async () => {
    const result = await validate({ input: '# Hi', schema: '# Hi' });
    expect(result).toEqual({ success: true, output: {} });
  });

  it('should fail validation', async () => {
    const result = await validate({ input: '# Hi', schema: '# Hello' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Node content mismatch');
      expect(result.error).toContain("Expected ' Hi' but found ' Hello'");
    }
  });
});

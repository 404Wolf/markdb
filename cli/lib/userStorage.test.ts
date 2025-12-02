import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as os from 'node:os';
import { UserStorage, type StoredUser } from './userStorage';

describe('UserStorage', () => {
  let tempDir: string;
  let userStorage: UserStorage;
  let originalEnv: string | undefined;

  beforeEach(async () => {
    // Create a temporary directory for testing
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'markdb-test-'));
    
    // Override XDG_DATA_HOME to use temp directory
    originalEnv = process.env.XDG_DATA_HOME;
    process.env.XDG_DATA_HOME = tempDir;
    
    // Create UserStorage instance with temp directory
    userStorage = new UserStorage(tempDir);
  });

  afterEach(async () => {
    // Restore original environment
    if (originalEnv !== undefined) {
      process.env.XDG_DATA_HOME = originalEnv;
    } else {
      delete process.env.XDG_DATA_HOME;
    }
    
    // Clean up temp directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  it('should return null when no user is stored', async () => {
    const user = await userStorage.getUser();
    expect(user).toBeNull();
  });

  it('should store and retrieve a user', async () => {
    const testUser: StoredUser = {
      _id: '123',
      name: 'Test User',
      email: 'test@example.com',
    };

    await userStorage.setUser(testUser);
    const retrievedUser = await userStorage.getUser();

    expect(retrievedUser).toEqual(testUser);
  });

  it('should create directory if it does not exist', async () => {
    const nonExistentDir = path.join(tempDir, 'nested', 'path');
    const storage = new UserStorage(nonExistentDir);

    const testUser: StoredUser = {
      _id: '456',
      name: 'Another User',
      email: 'another@example.com',
    };

    await storage.setUser(testUser);
    const retrievedUser = await storage.getUser();

    expect(retrievedUser).toEqual(testUser);
  });

  it('should overwrite existing user', async () => {
    const firstUser: StoredUser = {
      _id: '111',
      name: 'First User',
      email: 'first@example.com',
    };

    const secondUser: StoredUser = {
      _id: '222',
      name: 'Second User',
      email: 'second@example.com',
    };

    await userStorage.setUser(firstUser);
    await userStorage.setUser(secondUser);
    const retrievedUser = await userStorage.getUser();

    expect(retrievedUser).toEqual(secondUser);
  });

  it('should clear stored user', async () => {
    const testUser: StoredUser = {
      _id: '789',
      name: 'Clear Me',
      email: 'clear@example.com',
    };

    await userStorage.setUser(testUser);
    await userStorage.clearUser();
    const retrievedUser = await userStorage.getUser();

    expect(retrievedUser).toBeNull();
  });

  it('should not throw when clearing non-existent user', async () => {
    await expect(async () => {
      await userStorage.clearUser();
    }).not.toThrow();
  });

  it('should persist user data as valid JSON', async () => {
    const testUser: StoredUser = {
      _id: 'json-test',
      name: 'JSON User',
      email: 'json@example.com',
    };

    await userStorage.setUser(testUser);
    
    const filePath = path.join(tempDir, 'user.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const parsedData = JSON.parse(fileContent);

    expect(parsedData).toEqual(testUser);
  });

  it('should handle special characters in user data', async () => {
    const testUser: StoredUser = {
      _id: 'special-chars',
      name: 'User with "quotes" and \\backslashes\\',
      email: 'special+chars@example.com',
    };

    await userStorage.setUser(testUser);
    const retrievedUser = await userStorage.getUser();

    expect(retrievedUser).toEqual(testUser);
  });
});

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import xdgAppPaths from 'xdg-app-paths';

const paths = xdgAppPaths({ name: 'markdb' });

export interface StoredUser {
  _id: string;
  name: string;
  email: string;
}

export class UserStorage {
  private configDir: string;
  private configFile: string;

  constructor(dataDir?: string) {
    this.configDir = dataDir || paths.data();
    this.configFile = path.join(this.configDir, 'user.json');
  }

  async getUser(): Promise<StoredUser | null> {
    try {
      const content = await fs.readFile(this.configFile, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  async setUser(user: StoredUser): Promise<void> {
    await fs.mkdir(this.configDir, { recursive: true });
    await fs.writeFile(this.configFile, JSON.stringify(user, null, 2), 'utf-8');
  }

  async clearUser(): Promise<void> {
    try {
      await fs.unlink(this.configFile);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }
}

export const userStorage = new UserStorage();

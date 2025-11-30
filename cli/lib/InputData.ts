import * as fs from 'node:fs/promises';

export class InputData {
  constructor(private path: string) { }

  async read(): Promise<string> {
    if (this.path === '-') {
      return await new Promise<string>((resolve, reject) => {
        let data = '';
        process.stdin.setEncoding('utf8');
        process.stdin.on('data', (chunk) => {
          data += chunk;
        });
        process.stdin.on('end', () => {
          resolve(data);
        });
        process.stdin.on('error', reject);
      });
    } else {
      return await fs.readFile(this.path, "utf8");
    }
  }
}

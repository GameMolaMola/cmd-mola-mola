import { describe, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import { imageUrls } from '../src/components/game/imageLoader';

describe('imageLoader paths', () => {
  it('all referenced images exist', () => {
    const missing: string[] = [];
    for (const url of Object.values(imageUrls)) {
      const filePath = path.join(__dirname, '..', 'public', url.startsWith('/') ? url.slice(1) : url);
      if (!fs.existsSync(filePath)) {
        missing.push(url);
      }
    }

    if (missing.length) {
      throw new Error(`Missing image files: ${missing.join(', ')}`);
    }
  });
});

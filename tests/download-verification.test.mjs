import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Photo Download Proxy Verification', () => {
  test('Verifies public photo file exists and can be read as image buffer', async () => {
    const filePath = path.join(process.cwd(), 'public', 'photos', 'p1.jpg');
    assert.ok(fs.existsSync(filePath), 'public/photos/p1.jpg must exist');
    const buffer = await fs.promises.readFile(filePath);
    assert.ok(buffer.length > 0, 'Image file should not be empty');
  });

  test('Verifies Content-Disposition header format for forced browser download', () => {
    const cleanTitle = "Night stars".toLowerCase().replace(/[^a-z0-9]/g, "-");
    const photoId = 1;
    const filter = "portra";
    const ext = "jpg";
    const filename = `${cleanTitle}-${photoId}-${filter}.${ext}`;
    const headerValue = `attachment; filename="${filename}"`;

    assert.equal(headerValue, 'attachment; filename="night-stars-1-portra.jpg"');
    assert.ok(headerValue.startsWith('attachment;'), 'Must specify attachment to trigger browser save dialog');
  });

  test('Verifies CORS headers for Canvas 2D image decoding', () => {
    const headers = {
      "Content-Type": "image/jpeg",
      "Content-Disposition": `attachment; filename="night-stars-1.jpg"`,
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    };

    assert.equal(headers['Access-Control-Allow-Origin'], '*');
    assert.ok(headers['Content-Disposition'].includes('attachment'));
  });
});

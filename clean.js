import fs from 'fs';
import path from 'path';

const targets = [
  'node_modules',
  '.next',
  'tsconfig.tsbuildinfo',
  'backend/node_modules',
  'backend/dist',
  'backend/tsconfig.build.tsbuildinfo',
];

targets.forEach((target) => {
  const fullPath = path.resolve(process.cwd(), target);
  if (fs.existsSync(fullPath)) {
    fs.rmSync(fullPath, { recursive: true, force: true });
    console.log(`Successfully removed: ${target}`);
  } else {
    console.log(`Skipped (not found): ${target}`);
  }
});

console.log('All caches, build files, and node_modules cleaned successfully!');
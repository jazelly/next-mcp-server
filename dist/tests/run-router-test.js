#!/usr/bin/env node
// Simple script to run the router test
import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
console.log('Running router analysis test...');
const result = spawnSync('node', [
    '--experimental-vm-modules',
    'node_modules/jest/bin/jest.js',
    'operations/router.test.ts'
], {
    stdio: 'inherit',
    cwd: process.cwd()
});
if (result.error) {
    console.error('Error running test:', result.error);
    process.exit(1);
}
process.exit(result.status);

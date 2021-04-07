#!/usr/bin/env node
'use strict';

/**
 * @file cli.js
 * @description CLI entry point for readme-gen.
 * @usage readme-gen [dir] [--write] [--force] [--badges] [--toc] [--api]
 * @author idirdev
 */

const path = require('path');
const {
  readPackageJson,
  generateReadme,
  hasReadme,
  writeReadme,
} = require('../src/index.js');

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const positional = args.filter((a) => !a.startsWith('--'));

const dir = path.resolve(positional[0] || '.');
const doWrite = flags.has('--write');
const force = flags.has('--force');
const badges = !flags.has('--no-badges');
const toc = flags.has('--toc');
const api = flags.has('--api');

let pkgObj;
try {
  pkgObj = readPackageJson(dir);
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}

const content = generateReadme(pkgObj, { badges, toc, api });

if (doWrite) {
  if (hasReadme(dir) && !force) {
    console.error('README.md already exists. Use --force to overwrite.');
    process.exit(1);
  }
  writeReadme(dir, content);
  console.log('README.md written to', dir);
} else {
  process.stdout.write(content);
}

'use strict';

/**
 * @file index.test.js
 * @description Tests for readme-gen.
 * @author idirdev
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  readPackageJson,
  generateReadme,
  hasReadme,
  writeReadme,
  generateBadges,
  generateToc,
} = require('../src/index.js');

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'readme-gen-'));
}

const SAMPLE = {
  name: '@test/sample',
  version: '2.0.0',
  description: 'A sample package for testing',
  main: 'src/index.js',
  license: 'MIT',
  engines: { node: '>=18.0.0' },
  scripts: { test: 'node --test', build: 'tsc' },
  dependencies: { express: '^4.18.0' },
};

test('readPackageJson reads a valid file', () => {
  const dir = tmpDir();
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(SAMPLE));
  const result = readPackageJson(dir);
  assert.equal(result.name, SAMPLE.name);
  assert.equal(result.version, SAMPLE.version);
});

test('readPackageJson throws on missing file', () => {
  const dir = tmpDir();
  assert.throws(() => readPackageJson(dir), /No package.json found/);
});

test('generateBadges returns badge for name, license, engines', () => {
  const badges = generateBadges(SAMPLE);
  assert.equal(badges.length, 3);
  assert.ok(badges[0].includes('shields.io/npm/v'));
  assert.ok(badges[1].includes('License-MIT'));
  assert.ok(badges[2].includes('node'));
});

test('generateBadges handles missing optional fields', () => {
  assert.equal(generateBadges({ name: 'x' }).length, 1);
  assert.equal(generateBadges({}).length, 0);
});

test('generateToc produces anchored list', () => {
  const toc = generateToc(['Installation', 'Usage', 'API Reference']);
  assert.ok(toc.includes('## Table of Contents'));
  assert.ok(toc.includes('[Installation](#installation)'));
  assert.ok(toc.includes('[API Reference](#api-reference)'));
});

test('generateReadme contains title and description', () => {
  const md = generateReadme(SAMPLE);
  assert.ok(md.startsWith('# @test/sample'));
  assert.ok(md.includes('A sample package for testing'));
});

test('generateReadme contains install section', () => {
  const md = generateReadme(SAMPLE);
  assert.ok(md.includes('## Installation'));
  assert.ok(md.includes('npm install'));
});

test('generateReadme contains scripts table', () => {
  const md = generateReadme(SAMPLE);
  assert.ok(md.includes('## Scripts'));
  assert.ok(md.includes('| test |'));
  assert.ok(md.includes('| build |'));
});

test('generateReadme includes TOC when toc:true', () => {
  const md = generateReadme(SAMPLE, { toc: true });
  assert.ok(md.includes('## Table of Contents'));
  assert.ok(md.includes('[Installation]'));
});

test('generateReadme includes API section when api:true', () => {
  const md = generateReadme(SAMPLE, { api: true });
  assert.ok(md.includes('## API'));
});

test('generateReadme omits badges when badges:false', () => {
  const md = generateReadme(SAMPLE, { badges: false });
  assert.ok(!md.includes('shields.io'));
});

test('hasReadme returns true when README.md present', () => {
  const dir = tmpDir();
  fs.writeFileSync(path.join(dir, 'README.md'), '# hi');
  assert.equal(hasReadme(dir), true);
});

test('hasReadme returns false when README.md absent', () => {
  assert.equal(hasReadme(tmpDir()), false);
});

test('writeReadme writes content to README.md', () => {
  const dir = tmpDir();
  writeReadme(dir, '# Hello\n');
  assert.equal(fs.readFileSync(path.join(dir, 'README.md'), 'utf8'), '# Hello\n');
});

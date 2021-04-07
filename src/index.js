'use strict';

/**
 * @module readme-gen
 * @description Generate README.md from package.json metadata.
 * @author idirdev
 */

const fs = require('fs');
const path = require('path');

/**
 * Shield markdown badge templates keyed by badge type.
 * @constant {Object}
 */
const BADGE_TEMPLATES = {
  npm: (name) =>
    `[![npm version](https://img.shields.io/npm/v/${name}.svg)](https://www.npmjs.com/package/${name})`,
  license: (lic) =>
    `[![License: ${lic}](https://img.shields.io/badge/License-${lic}-yellow.svg)](https://opensource.org/licenses/${lic})`,
  node: (engines) => {
    const ver = (engines && engines.node)
      ? engines.node.replace(/[^0-9.]/g, '')
      : '16';
    return `[![Node.js ${ver}+](https://img.shields.io/badge/node-${ver}%2B-brightgreen.svg)](https://nodejs.org)`;
  },
};

/**
 * Read and parse package.json from the given directory.
 * @param {string} dir - Directory containing package.json.
 * @returns {Object} Parsed package.json object.
 * @throws {Error} If package.json is missing or cannot be parsed.
 */
function readPackageJson(dir) {
  const file = path.join(dir, 'package.json');
  if (!fs.existsSync(file)) {
    throw new Error('No package.json found in ' + dir);
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

/**
 * Generate badge markdown strings for a package.
 * @param {Object} pkg - Parsed package.json object.
 * @returns {string[]} Array of badge markdown strings.
 */
function generateBadges(pkg) {
  const badges = [];
  if (pkg.name) badges.push(BADGE_TEMPLATES.npm(pkg.name));
  if (pkg.license) badges.push(BADGE_TEMPLATES.license(pkg.license));
  if (pkg.engines) badges.push(BADGE_TEMPLATES.node(pkg.engines));
  return badges;
}

/**
 * Generate a markdown table of contents from an array of section names.
 * @param {string[]} sections - Section title strings.
 * @returns {string} Markdown TOC block.
 */
function generateToc(sections) {
  const items = sections.map((s) => {
    const anchor = s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    return '- [' + s + '](#' + anchor + ')';
  });
  return '## Table of Contents\n\n' + items.join('\n') + '\n';
}

/**
 * Build a usage section from package metadata.
 * @param {Object} pkg - Parsed package.json object.
 * @returns {string} Markdown usage section.
 */
function buildUsageSection(pkg) {
  const lines = ['## Usage', ''];
  if (pkg.bin && typeof pkg.bin === 'object') {
    lines.push('**CLI:**', '');
    lines.push('```bash');
    Object.keys(pkg.bin).forEach((cmd) => lines.push(cmd + ' --help'));
    lines.push('```', '');
  } else if (pkg.main) {
    lines.push('**Programmatic:**', '');
    lines.push('```js');
    lines.push("const mod = require('" + (pkg.name || pkg.main) + "');");
    lines.push('```', '');
  }
  return lines.join('\n');
}

/**
 * Build a scripts table section.
 * @param {Object} scripts - Scripts map from package.json.
 * @returns {string} Markdown table, or empty string if no scripts.
 */
function buildScriptsTable(scripts) {
  if (!scripts || !Object.keys(scripts).length) return '';
  const rows = Object.entries(scripts).map(([k, v]) => '| ' + k + ' | `' + v + '` |');
  return ['## Scripts', '', '| Script | Command |', '|--------|---------|', ...rows, ''].join('\n');
}

/**
 * Build a dependencies table section.
 * @param {Object} deps - Dependency map.
 * @param {string} title - Section heading text.
 * @returns {string} Markdown table, or empty string if no deps.
 */
function buildDepsTable(deps, title) {
  if (!deps || !Object.keys(deps).length) return '';
  const rows = Object.entries(deps).map(([k, v]) => '| ' + k + ' | ' + v + ' |');
  return ['## ' + title, '', '| Package | Version |', '|---------|---------|', ...rows, ''].join('\n');
}

/**
 * Build a placeholder API section.
 * @returns {string} Markdown API section.
 */
function buildApiSection() {
  return ['## API', '', '> Auto-generated API documentation.', ''].join('\n');
}

/**
 * Generate README markdown content from a parsed package.json object.
 * @param {Object} pkgObj - Parsed package.json object.
 * @param {Object} [opts={}] - Generation options.
 * @param {boolean} [opts.badges=true] - Include shield badges.
 * @param {boolean} [opts.toc=false] - Include table of contents.
 * @param {boolean} [opts.api=false] - Include API section placeholder.
 * @returns {string} Full README markdown string.
 */
function generateReadme(pkgObj, opts) {
  const options = opts || {};
  const includeBadges = options.badges !== false;
  const includeToc = !!options.toc;
  const includeApi = !!options.api;

  let out = '# ' + (pkgObj.name || 'Package') + '\n\n';
  if (pkgObj.description) out += pkgObj.description + '\n\n';

  if (includeBadges) {
    const badgeList = generateBadges(pkgObj);
    if (badgeList.length) out += badgeList.join(' ') + '\n\n';
  }

  const sections = ['Installation', 'Usage'];
  if (includeApi) sections.push('API');
  if (pkgObj.scripts && Object.keys(pkgObj.scripts).length) sections.push('Scripts');
  if (pkgObj.dependencies && Object.keys(pkgObj.dependencies).length) sections.push('Dependencies');
  if (pkgObj.devDependencies && Object.keys(pkgObj.devDependencies).length) sections.push('Dev Dependencies');
  if (pkgObj.license) sections.push('License');

  if (includeToc) out += generateToc(sections) + '\n';

  out += '## Installation\n\n```bash\nnpm install ' + (pkgObj.name || '') + '\n```\n\n';
  out += buildUsageSection(pkgObj) + '\n';

  if (includeApi) out += buildApiSection() + '\n';

  const scriptsSection = buildScriptsTable(pkgObj.scripts);
  if (scriptsSection) out += scriptsSection + '\n';

  const depsSection = buildDepsTable(pkgObj.dependencies, 'Dependencies');
  if (depsSection) out += depsSection + '\n';

  const devDepsSection = buildDepsTable(pkgObj.devDependencies, 'Dev Dependencies');
  if (devDepsSection) out += devDepsSection + '\n';

  if (pkgObj.license) out += '## License\n\n' + pkgObj.license + '\n';

  return out;
}

/**
 * Check whether a README.md file exists in the given directory.
 * @param {string} dir - Directory to check.
 * @returns {boolean} True if a README.md exists.
 */
function hasReadme(dir) {
  try {
    return fs.readdirSync(dir).some((f) => f.toLowerCase() === 'readme.md');
  } catch {
    return false;
  }
}

/**
 * Write README markdown content to disk.
 * @param {string} dir - Target directory.
 * @param {string} content - README markdown string.
 */
function writeReadme(dir, content) {
  fs.writeFileSync(path.join(dir, 'README.md'), content, 'utf8');
}

module.exports = {
  readPackageJson,
  generateReadme,
  hasReadme,
  writeReadme,
  generateBadges,
  generateToc,
};

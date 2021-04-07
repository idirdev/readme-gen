# readme-gen

> **[EN]** Automatically generate a Markdown README.md from a package's `package.json` — includes badges, installation, usage, scripts, and dependencies sections with zero configuration.
> **[FR]** Générez automatiquement un README.md en Markdown depuis le `package.json` d'un paquet — inclut badges, installation, utilisation, scripts et sections de dépendances sans aucune configuration.

---

## Features / Fonctionnalités

**[EN]**
- Reads `package.json` from any directory and generates a structured README
- Includes a license badge (shields.io) when a license field is present
- Detects CLI packages (`bin` field) and generates global install + usage section
- Detects library packages and generates local install section
- Lists all npm scripts with their commands
- Lists all runtime dependencies with version constraints
- `--write` flag to write the README directly to disk
- `--force` flag to overwrite an existing README.md
- Preview mode (default): prints to stdout without touching files

**[FR]**
- Lit le `package.json` de n'importe quel répertoire et génère un README structuré
- Inclut un badge de licence (shields.io) lorsqu'un champ de licence est présent
- Détecte les paquets CLI (champ `bin`) et génère une section d'installation globale + utilisation
- Détecte les paquets bibliothèque et génère une section d'installation locale
- Liste tous les scripts npm avec leurs commandes
- Liste toutes les dépendances d'exécution avec les contraintes de version
- Option `--write` pour écrire le README directement sur le disque
- Option `--force` pour écraser un README.md existant
- Mode aperçu (par défaut) : affiche sur stdout sans toucher aux fichiers

---

## Installation

```bash
npm install -g @idirdev/readme-gen
```

---

## CLI Usage / Utilisation CLI

```bash
# Preview README for the current package (aperçu du README du paquet courant)
readme-gen

# Preview README for a specific package directory (aperçu pour un répertoire spécifique)
readme-gen ./packages/my-lib

# Write README.md to disk (écrire README.md sur le disque)
readme-gen --write

# Overwrite an existing README.md (écraser un README.md existant)
readme-gen --write --force

# Generate README for a subdirectory (générer un README pour un sous-répertoire)
readme-gen ./packages/my-tool --write --force

# Show help (afficher l'aide)
readme-gen --help
```

### Example Output / Exemple de sortie

```markdown
# my-api

> A REST API for managing users

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Installation

```bash
npm install -g my-api
```

## Usage

```bash
my-api --help
```

## Scripts

- `start`: node src/app.js
- `dev`: node --watch src/app.js
- `test`: node --test tests/

## Dependencies

- express: ^4.18.0

## License

MIT
```

---

## API (Programmatic) / API (Programmation)

```js
const { generateReadme, hasReadme } = require('@idirdev/readme-gen');

// Check if a README already exists (vérifier si un README existe déjà)
if (!hasReadme('./packages/my-lib')) {
  const md = generateReadme('./packages/my-lib');
  require('fs').writeFileSync('./packages/my-lib/README.md', md);
  console.log('README created');
}

// Generate README content as a string (générer le contenu README sous forme de chaîne)
const content = generateReadme('./my-package');
console.log(content);

// Batch generate READMEs for all packages in a monorepo
// (générer des READMEs par lot pour tous les paquets d'un monorepo)
const fs = require('fs');
const path = require('path');
const packagesDir = './packages';
fs.readdirSync(packagesDir).forEach(name => {
  const dir = path.join(packagesDir, name);
  if (!hasReadme(dir)) {
    const md = generateReadme(dir);
    fs.writeFileSync(path.join(dir, 'README.md'), md);
    console.log(`README created for ${name}`);
  } else {
    console.log(`README already exists for ${name}, skipping`);
  }
});
```

---

## License

MIT © idirdev

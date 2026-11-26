/**
 * Falha quando alguma dependência ou Action não está fixada.
 *
 *   bun scripts/check-pins.ts
 *
 * - package.json: toda versão precisa ser exata (sem ^, ~, *, x, latest, ranges, tags ou git sem commit);
 * - bun.lock: os especificadores do workspace precisam bater com o package.json;
 * - .github/workflows: todo `uses:` de terceiros precisa apontar para um SHA de 40 caracteres.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dir, '..');
const EXACT = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/;
const problems: string[] = [];

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const sections = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'] as const;
for (const section of sections) {
  for (const [name, spec] of Object.entries<string>(pkg[section] ?? {})) {
    if (!EXACT.test(spec)) problems.push(`package.json ${section}.${name}: "${spec}" não é versão exata`);
  }
}
if (pkg.packageManager && !/^bun@\d+\.\d+\.\d+$/.test(pkg.packageManager)) {
  problems.push(`package.json packageManager: "${pkg.packageManager}" não é versão exata`);
}

const lockPath = join(ROOT, 'bun.lock');
if (existsSync(lockPath)) {
  const lockText = readFileSync(lockPath, 'utf8');
  const head = lockText.slice(0, lockText.indexOf('"packages"'));
  for (const section of sections) {
    for (const [name, spec] of Object.entries<string>(pkg[section] ?? {})) {
      const escaped = name.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
      const match = head.match(new RegExp(`"${escaped}":\\s*"([^"]+)"`));
      if (!match) problems.push(`bun.lock: ${name} ausente no workspace`);
      else if (match[1] !== spec) problems.push(`bun.lock: ${name} está "${match[1]}", package.json diz "${spec}"`);
    }
  }
} else {
  problems.push('bun.lock ausente');
}

const workflows = join(ROOT, '.github', 'workflows');
if (existsSync(workflows)) {
  for (const file of readdirSync(workflows).filter((f) => /\.ya?ml$/.test(f))) {
    readFileSync(join(workflows, file), 'utf8')
      .split(/\r?\n/)
      .forEach((line, i) => {
        const m = line.match(/^\s*-?\s*uses:\s*([^\s#]+)/);
        if (!m || m[1]!.startsWith('./')) return;
        const ref = m[1]!.split('@')[1] ?? '';
        if (!/^[0-9a-f]{40}$/.test(ref)) problems.push(`${file}:${i + 1}: "${m[1]}" precisa apontar para um SHA de commit`);
      });
  }
}

if (problems.length) {
  console.error(`Encontrei ${problems.length} item(ns) sem versão fixa:\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log('Todas as dependências e Actions estão fixadas.');

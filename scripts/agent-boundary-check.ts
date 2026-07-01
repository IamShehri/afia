#!/usr/bin/env tsx

import fs from "node:fs";
import { execSync } from "node:child_process";

const CLINICAL_MODULES = ["notes", "patients", "labs", "medications"];
const COMPOSER = "lib/clinical-timeline.ts";
const MODULE_LOADER = "lib/clinical-modules.ts";
const REGISTRY = "lib/clinical-registry.ts";
const TIMELINE_PAGE = "app/(app)/patients/[patientId]/timeline/page.tsx";
const ALLOWED_REGISTRAR_FILES = [
  ...CLINICAL_MODULES.map((m) => `lib/${m}.ts`),
  "lib/clinical-timeline/index.ts",
];

function walkTsFiles(dirs: string[]) {
  const files: string[] = [];

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;

    for (const entry of fs.readdirSync(dir, { withFileTypes: true, recursive: true })) {
      if (!entry.isFile()) continue;
      const parent = entry.parentPath ?? (entry as { path?: string }).path ?? dir;
      const file = `${parent}/${entry.name}`.replace(/\\/g, "/");
      if (file.endsWith(".ts") || file.endsWith(".tsx")) files.push(file);
    }
  }

  return files;
}

function gitFiles(mode: string) {
  const cmd =
    mode === "--staged"
      ? "git diff --cached --name-only"
      : "git ls-files";

  try {
    return execSync(cmd, { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .split("\n")
      .filter(Boolean);
  } catch {
    return walkTsFiles(["lib", "app"]);
  }
}

function read(file: string) {
  return fs.readFileSync(file, "utf-8");
}

function getImports(content: string) {
  const matches = [...content.matchAll(/from\s+['"]([^'"]+)['"]/g)];
  return matches.map((m) => m[1]);
}

function isClinicalImport(imp: string) {
  return CLINICAL_MODULES.some((m) => imp.includes(m));
}

function check(file: string) {
  const content = read(file);
  const imports = getImports(content);

  const clinicalImports = imports.filter(isClinicalImport);

  // RULE A
  if (file === TIMELINE_PAGE && clinicalImports.length > 0) {
    throw new Error(
      `[RULE_A] Timeline page cannot import clinical modules: ${clinicalImports.join(", ")}`
    );
  }

  // RULE B
  if (
    file !== COMPOSER &&
    file !== REGISTRY &&
    imports.some((imp) => imp.includes("clinical-registry")) &&
    /\bgetRegistry\s*\(/.test(content)
  ) {
    throw new Error(
      `[RULE_B] Only clinical-timeline.ts may compose from the clinical registry: ${file}`
    );
  }

  if (file !== COMPOSER && file !== MODULE_LOADER && clinicalImports.length > 1) {
    throw new Error(
      `[RULE_B] Only composer or module loader may import multiple clinical modules in: ${file}`
    );
  }

  // RULE C
  if (file === "lib/patients.ts" && clinicalImports.length > 0) {
    throw new Error(
      `[RULE_C] patients.ts cannot import clinical modules`
    );
  }

  // RULE D
  if (
    file !== COMPOSER &&
    (content.includes(".concat(") ||
      content.includes("...") ||
      content.includes(".sort((a, b) => new Date"))
  ) {
    throw new Error(
      `[RULE_D] Duplicate composition logic detected in ${file}`
    );
  }

  // RULE E
  if (
    file !== REGISTRY &&
    /\bregisterClinicalModule\s*\(/.test(content) &&
    !ALLOWED_REGISTRAR_FILES.includes(file)
  ) {
    throw new Error(
      `[RULE_E] Only clinical module files may register: ${file}`
    );
  }

  // RULE E — registry import restricted to modules + composer loader
  if (
    imports.some((imp) => imp.includes("clinical-registry")) &&
    file !== REGISTRY &&
    file !== COMPOSER &&
    file !== MODULE_LOADER &&
    !ALLOWED_REGISTRAR_FILES.includes(file)
  ) {
    throw new Error(
      `[RULE_E] clinical-registry may only be imported by modules, composer, or module loader: ${file}`
    );
  }
}

function main() {
  const files = gitFiles("--staged");

  for (const file of files) {
    if (!file.endsWith(".ts") && !file.endsWith(".tsx")) continue;
    if (!file.includes("lib") && !file.includes("app")) continue;

    check(file);
  }

  console.log("✅ Agent boundary check passed");
}

main();

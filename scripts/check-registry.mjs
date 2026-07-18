import { createHash } from "node:crypto"
import { readdirSync, readFileSync } from "node:fs"
import { dirname, relative, resolve } from "node:path"
import { spawnSync } from "node:child_process"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const generatedDirectory = resolve(root, "public/r")

function snapshot(directory, files = new Map()) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name)

    if (entry.isDirectory()) {
      snapshot(path, files)
      continue
    }

    const name = relative(generatedDirectory, path).replaceAll("\\", "/")
    const hash = createHash("sha256").update(readFileSync(path)).digest("hex")
    files.set(name, hash)
  }

  return files
}

function run(script) {
  const result = spawnSync("pnpm", [script], {
    cwd: root,
    shell: true,
    stdio: "inherit",
  })

  if (result.status !== 0) process.exit(result.status ?? 1)
}

const before = snapshot(generatedDirectory)

run("registry:validate")
run("registry:build")

const after = snapshot(generatedDirectory)
const changedFiles = [...new Set([...before.keys(), ...after.keys()])].filter(
  (name) => before.get(name) !== after.get(name)
)

if (changedFiles.length > 0) {
  console.error("Registry output was out of date:")
  for (const name of changedFiles) console.error(`- public/r/${name}`)
  process.exit(1)
}

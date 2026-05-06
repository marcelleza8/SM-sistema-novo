import { access, readdir, rename, rm } from "node:fs/promises";
import { constants } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";

const cwd = process.cwd();
const distDir = path.join(cwd, "dist");
const tempDir = path.join(cwd, ".dist_tmp");

const run = (cmd, args) =>
  new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: "inherit", cwd, shell: false });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) return resolve();
      reject(new Error(`${cmd} ${args.join(" ")} exited with code ${code}`));
    });
  });

const pathExists = async (targetPath) => {
  try {
    await access(targetPath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
};

const getNextDistVersion = async () => {
  const entries = await readdir(cwd, { withFileTypes: true });
  const versions = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .map((name) => /^dist(\d+)$/.exec(name))
    .filter(Boolean)
    .map((match) => Number(match[1]));

  if (!versions.length) return 1;
  return Math.max(...versions) + 1;
};

const main = async () => {
  await rm(tempDir, { recursive: true, force: true });

  console.log("1/3 Buildando frontend em .dist_tmp...");
  await run("npm", ["run", "build", "--", "--outDir", ".dist_tmp"]);

  if (!(await pathExists(tempDir))) {
    throw new Error("Build finalizado sem gerar .dist_tmp");
  }

  if (await pathExists(distDir)) {
    const nextVersion = await getNextDistVersion();
    const archivedDist = path.join(cwd, `dist${nextVersion}`);
    console.log(`2/3 Movendo dist atual para dist${nextVersion}...`);
    await rename(distDir, archivedDist);
  } else {
    console.log("2/3 Nenhuma dist atual para versionar.");
  }

  console.log("3/3 Publicando novo build em dist...");
  await rename(tempDir, distDir);
  console.log("Deploy local concluído.");
};

main().catch(async (error) => {
  console.error(error instanceof Error ? error.message : error);
  await rm(tempDir, { recursive: true, force: true });
  process.exit(1);
});

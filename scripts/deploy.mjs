import { access, readdir, rename, rm } from "node:fs/promises";
import { constants } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";
import { readFileSync } from "node:fs";

const cwd = process.cwd();
const repoRoot = path.resolve(cwd, "..");
const distDir = path.join(cwd, "dist");
const tempDir = path.join(cwd, ".dist_tmp");
const dockerEnvPath = path.join(repoRoot, ".env.docker");

const parseEnvFile = (filePath) => {
  const raw = readFileSync(filePath, "utf8");
  const env = {};

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eqIndex = trimmed.indexOf("=");
    if (eqIndex < 0) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
};

const getBuildEnv = () => {
  const dockerEnv = parseEnvFile(dockerEnvPath);

  const viteDefaults = {
    VITE_APPNAME: "SM Gestao Financeira 2.0",
    VITE_MONOLITH_URL: "/",
    VITE_BASE_URL: "/api/v1/",
    VITE_GRANT_TYPE: "password",
    VITE_SCOPE: "",
    VITE_API_DENO_URL: "/api",
    VITE_API_FLASK_URL: "http://localhost:5000/",
  };

  const viteEnvFromDocker = Object.fromEntries(
    Object.entries(dockerEnv).filter(([key]) => key.startsWith("VITE_"))
  );

  const buildEnv = {
    ...viteDefaults,
    ...viteEnvFromDocker,
  };

  if (!buildEnv.VITE_CLIENT_ID || !buildEnv.VITE_CLIENT_SECRET) {
    throw new Error(
      "VITE_CLIENT_ID/VITE_CLIENT_SECRET ausentes em .env.docker. Nao e possivel gerar build de producao."
    );
  }

  return buildEnv;
};

const run = (cmd, args, env = process.env) =>
  new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: "inherit", cwd, shell: false, env });
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
  const buildEnv = getBuildEnv();
  await rm(tempDir, { recursive: true, force: true });

  console.log("1/3 Buildando frontend em .dist_tmp...");
  await run(
    "npm",
    ["run", "build", "--", "--outDir", ".dist_tmp"],
    { ...process.env, ...buildEnv }
  );

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

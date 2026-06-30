import { execSync } from "node:child_process";

const REMOTE_NAME = "github";
const REMOTE_URL = "https://github.com/AbdulrahmanNasherAlOtaibi/arbon";

function run(cmd: string): string {
  return execSync(cmd).toString().trim();
}

function ensureRemote(): void {
  let existing: string | null = null;
  try {
    existing = run(`git remote get-url ${REMOTE_NAME}`);
  } catch {
    existing = null;
  }

  if (existing === null) {
    console.log(`Remote "${REMOTE_NAME}" not found — adding it now...`);
    run(`git remote add ${REMOTE_NAME} ${REMOTE_URL}`);
    console.log(`Remote "${REMOTE_NAME}" added: ${REMOTE_URL}`);
  } else if (existing !== REMOTE_URL) {
    console.error(
      `Remote "${REMOTE_NAME}" exists but points to a different URL:\n` +
        `  current : ${existing}\n` +
        `  expected: ${REMOTE_URL}\n` +
        `Run \`git remote set-url ${REMOTE_NAME} ${REMOTE_URL}\` to fix it.`
    );
    process.exit(1);
  } else {
    console.log(`Remote "${REMOTE_NAME}" already configured: ${REMOTE_URL}`);
  }
}

ensureRemote();

const branch = run("git rev-parse --abbrev-ref HEAD");
console.log(`Pushing branch "${branch}" to ${REMOTE_NAME}...`);
execSync(`git push ${REMOTE_NAME} ${branch}`, { stdio: "inherit" });
console.log("Done.");

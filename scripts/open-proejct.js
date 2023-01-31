/* 
# Open a project in vscode

- Original script by [KCD](https://kentcdodds.com/): https://www.scriptkit.com/kentcdodds/open-project

*/

// Menu: Open Project
// Description: Opens a project in code
// Shortcut: cmd shift .
import path from "path";
import fs from "fs";

const BASE_PATH = await env("OPEN_PROJECT_BASE_PATH");

const isDirectory = async (filePath) => {
  try {
    const stat = await fs.promises.stat(filePath);
    return stat.isDirectory();
  } catch (e) {
    return false;
  }
};
const isFile = async (filePath) => {
  try {
    const stat = await fs.promises.stat(filePath);
    return stat.isFile();
  } catch (e) {
    return false;
  }
};

async function getProjects(parentDir) {
  const codeDir = (await ls(parentDir)).stdout.split("\n").filter(Boolean);
  const choices = [];
  for (const dir of codeDir) {
    let fullPath = dir;
    if (!path.isAbsolute(dir)) {
      fullPath = path.join(parentDir, dir);
    }
    if (fullPath.includes("/node_modules/")) continue;
    if (fullPath.includes("/build/")) continue;
    if (fullPath.includes("/dist/")) continue;
    if (fullPath.includes("/coverage/")) continue;

    const pkgjson = path.join(fullPath, "package.json");
    if (await isFile(pkgjson)) {
      choices.push({
        name: dir,
        value: fullPath,
        description: fullPath,
      });
    } else if (await isDirectory(fullPath)) {
      choices.push(...(await getProjects(fullPath)));
    }
  }
  return choices;
}

const choice = await arg("Which project?", async () => {
  const choices = [
    ...(await getProjects(BASE_PATH)),
    ...(await getProjects(BASE_PATH)),
  ];
  return choices;
});

exec(`code ${choice}`);

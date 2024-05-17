//@ts-check
import { rm } from "node:fs/promises";
import path from "node:path";

/**
 * @param {string} url
 */
function createFileInfo(url) {
  const i = "win32" === process.platform;
  let m = new URL(url).pathname;
  return (
    // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
    // biome-ignore lint/style/noCommaOperator: <explanation>
    m.startsWith("/") && i && (m = m.slice(1)),
    {
      __dirname: m
        .split("/")
        .slice(0, -1)
        .join(i ? "\\" : "/"),
      __filename: m,
    }
  );
}
const { __dirname } = createFileInfo(import.meta.url);

/**@param {string} file */
const getPath = (file) => path.resolve(__dirname, file);

/**@param {string} file */
const tryRemove = (file) => {
  return rm(getPath(file), { recursive: true }).catch(() => null);
};

tryRemove("../types").catch((err) => {
  console.error(err);
  process.exit(1);
});

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === ".git" || entry.name === "node_modules" || entry.name === "src") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else if (entry.name.endsWith(".html")) files.push(full);
  }
  return files;
}

const files = await walk(root);
const known = new Set(["/", "/sitemap.xml", "/robots.txt", "/llms.txt", "/css/styles.css", "/js/main.js", "/images/logo.svg"]);
for (const file of files) {
  let rel = `/${path.relative(root, file).replaceAll("\\", "/")}`;
  if (rel.endsWith("/index.html")) rel = rel.slice(0, -10);
  if (rel === "") rel = "/";
  if (!rel.endsWith(".html") && !rel.endsWith("/")) rel = `${rel}/`;
  known.add(rel);
}
for (const file of await readdir(path.join(root, "images"))) known.add(`/images/${file}`);

const bad = [];
for (const file of files) {
  const content = await readFile(file, "utf8");
  if (!content.includes("tel:+19702358596")) bad.push(`missing phone ${file}`);
  const hrefs = [...content.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
  for (const href of hrefs) {
    if (/^(https?:|tel:|mailto:|#)/.test(href)) continue;
    const pathOnly = href.split("#")[0];
    if (!known.has(pathOnly)) bad.push(`${path.relative(root, file)} -> ${pathOnly}`);
  }
}
console.log(bad.length ? bad.join("\n") : `links ok across ${files.length} pages`);

// Tiny "build": copies src/ to lib/ so we can see build order in the logs.
import { cpSync, rmSync, readFileSync } from "node:fs";
const name = JSON.parse(readFileSync("package.json", "utf8")).name;
rmSync("lib", { recursive: true, force: true });
cpSync("src", "lib", { recursive: true });
console.log(`built ${name} at ${new Date().toISOString()}`);

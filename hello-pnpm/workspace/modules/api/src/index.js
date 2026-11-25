import { createServer } from "node:http";
import { greet } from "@hello/common";
const port = process.env.PORT ?? 4000;
createServer((_, res) => res.end(greet({ name: "api" }) + "\n")).listen(port, () =>
  console.log(`api on ${port}`),
);
setTimeout(() => process.exit(0), 1500); // so demos exit by themselves

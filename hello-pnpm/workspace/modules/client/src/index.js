import { greet } from "@hello/common";
export const clientGreet = (name) => greet({ name }) + " (via client)";

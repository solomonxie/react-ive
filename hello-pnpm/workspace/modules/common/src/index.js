import { z } from "zod";
export const Greeting = z.object({ name: z.string().min(1) });
export const greet = (input) => `hello, ${Greeting.parse(input).name}`;

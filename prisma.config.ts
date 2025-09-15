import { defineConfig } from "prisma";

export default defineConfig({
  seed: {
    run: "ts-node --esm --require tsconfig-paths/register prisma/seed.ts",
  },
});

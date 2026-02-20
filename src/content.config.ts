import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const specs = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "src/contents/specs",
  }),
});

export const collections = { specs };

import { slugify } from "@/lib/slug";

export type NormalizedTag = {
  name: string;
  slug: string;
};

export function normalizeTags(names: string[]): NormalizedTag[] {
  const tagsBySlug = new Map<string, NormalizedTag>();

  for (const rawName of names) {
    const name = rawName.trim();
    if (!name) continue;

    const slug = slugify(name);
    if (!tagsBySlug.has(slug)) {
      tagsBySlug.set(slug, { name, slug });
    }
  }

  return Array.from(tagsBySlug.values());
}

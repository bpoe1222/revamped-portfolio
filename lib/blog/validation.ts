import { z } from "zod";

export const slugSchema = z
  .string()
  .trim()
  .min(2, "Slug must be at least 2 characters.")
  .max(120, "Slug must be 120 characters or fewer.")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use lowercase letters, numbers, and single hyphens only.",
  );

const optionalUrl = z.union([
  z.literal(""),
  z.string().url("Enter a valid absolute image URL.").max(2048),
]);

export const postInputSchema = z
  .object({
    title: z.string().trim().min(3).max(180),
    slug: slugSchema,
    excerpt: z.string().trim().min(10).max(500),
    content: z.string().trim().min(20),
    categoryId: z.union([z.string().uuid(), z.literal("")]),
    newCategory: z.string().trim().max(80).default(""),
    tags: z.string().trim().max(500).default(""),
    featuredImageUrl: optionalUrl.default(""),
    featuredImageAlt: z.string().trim().max(240).default(""),
    seoTitle: z.string().trim().max(70).default(""),
    seoDescription: z.string().trim().max(170).default(""),
    intent: z.enum(["draft", "publish", "schedule"]),
    scheduledFor: z.string().trim().default(""),
  })
  .superRefine((value, context) => {
    if (!value.categoryId && !value.newCategory) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["categoryId"],
        message: "Choose or create a category.",
      });
    }

    if (value.featuredImageUrl && !value.featuredImageAlt) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["featuredImageAlt"],
        message: "Alt text is required when an image is provided.",
      });
    }

    if (value.intent === "schedule") {
      const date = new Date(value.scheduledFor);
      if (!value.scheduledFor || Number.isNaN(date.getTime())) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["scheduledFor"],
          message: "Choose a valid publication date and time.",
        });
      } else if (date <= new Date()) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["scheduledFor"],
          message: "Scheduled publication must be in the future.",
        });
      }
    }
  });

export type PostInput = z.infer<typeof postInputSchema>;

export function formDataToPostInput(formData: FormData) {
  const permitted = {
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    categoryId: formData.get("categoryId"),
    newCategory: formData.get("newCategory"),
    tags: formData.get("tags"),
    featuredImageUrl: formData.get("featuredImageUrl"),
    featuredImageAlt: formData.get("featuredImageAlt"),
    seoTitle: formData.get("seoTitle"),
    seoDescription: formData.get("seoDescription"),
    intent: formData.get("intent"),
    scheduledFor: formData.get("scheduledFor"),
  };

  return postInputSchema.safeParse(permitted);
}

export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export function parseTags(value: string) {
  return [
    ...new Set(
      value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  ].slice(0, 12);
}

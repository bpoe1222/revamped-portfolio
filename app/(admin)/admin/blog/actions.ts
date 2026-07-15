"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminMutation } from "@/lib/auth";
import { deletePost, savePost, setPostStatus } from "@/lib/blog/mutations";
import { formDataToPostInput } from "@/lib/blog/validation";
import { allowMutation } from "@/lib/rate-limit";

export type EditorState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

function refreshBlogPaths(slug?: string) {
  revalidatePath("/blog");
  revalidatePath("/blog/archive");
  revalidatePath("/blog/rss.xml");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/blog/${slug}`);
}

async function guardMutation(action: string) {
  const admin = await requireAdminMutation();
  if (!allowMutation(`${admin.id}:${action}`))
    throw new Error("Too many requests");
  return admin;
}

export async function createPostAction(
  _state: EditorState,
  formData: FormData,
) {
  const admin = await guardMutation("save");
  const parsed = formDataToPostInput(formData);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Review the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const result = await savePost(parsed.data, admin.id);
  if (!result.ok) return { ok: false, error: result.error };
  refreshBlogPaths(result.slug);
  redirect(`/admin/blog/${result.id}/edit?saved=1`);
}

export async function updatePostAction(
  id: string,
  _state: EditorState,
  formData: FormData,
) {
  const admin = await guardMutation("save");
  const parsed = formDataToPostInput(formData);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Review the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const result = await savePost(parsed.data, admin.id, id);
  if (!result.ok) return { ok: false, error: result.error };
  refreshBlogPaths(result.slug);
  redirect(`/admin/blog/${id}/edit?saved=1`);
}

export async function publishPostAction(id: string) {
  await guardMutation("status");
  await setPostStatus(id, "published");
  refreshBlogPaths();
}

export async function unpublishPostAction(id: string) {
  await guardMutation("status");
  await setPostStatus(id, "draft");
  refreshBlogPaths();
}

export async function deletePostAction(id: string) {
  await guardMutation("delete");
  await deletePost(id);
  refreshBlogPaths();
  redirect("/admin/blog?deleted=1");
}

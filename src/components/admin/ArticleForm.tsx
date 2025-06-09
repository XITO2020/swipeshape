import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const articleSchema = z.object({
  title: z.string().min(3, "Titre trop court"),
  slug: z.string().min(3, "Slug trop court"),
  content: z.string().min(10, "Contenu trop court"),
  image: z.instanceof(File).optional(),
  videoUrl: z.string().url().optional(),
});

type ArticleFormData = z.infer<typeof articleSchema>;

export default function ArticleForm({
  initialValues,
  onSubmit,
}: {
  initialValues?: Partial<ArticleFormData>;
  onSubmit: (data: ArticleFormData) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: initialValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block font-medium">Titre</label>
        <input
          {...register("title")}
          className="w-full border rounded px-2 py-1"
        />
        {errors.title && (
          <p className="text-red-600 text-sm">{errors.title.message}</p>
        )}
      </div>
      <div>
        <label className="block font-medium">Slug</label>
        <input
          {...register("slug")}
          className="w-full border rounded px-2 py-1"
        />
        {errors.slug && (
          <p className="text-red-600 text-sm">{errors.slug.message}</p>
        )}
      </div>
      <div>
        <label className="block font-medium">Contenu</label>
        <textarea
          {...register("content")}
          className="w-full border rounded px-2 py-1"
          rows={6}
        />
        {errors.content && (
          <p className="text-red-600 text-sm">{errors.content.message}</p>
        )}
      </div>
      <div>
        <label className="block font-medium">Image (optionnelle)</label>
        <input type="file" {...register("image")} accept="image/*" />
        {errors.image && (
          <p className="text-red-600 text-sm">{errors.image.message}</p>
        )}
      </div>
      <div>
        <label className="block font-medium">Vidéo YouTube/TikTok (optionnelle)</label>
        <input
          {...register("videoUrl")}
          className="w-full border rounded px-2 py-1"
        />
        {errors.videoUrl && (
          <p className="text-red-600 text-sm">{errors.videoUrl.message}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-violet-600 text-white px-4 py-2 rounded hover:bg-violet-700"
      >
        {initialValues ? "Modifier l’article" : "Créer l’article"}
      </button>
    </form>
  );
}

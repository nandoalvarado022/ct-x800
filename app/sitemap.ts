import type { MetadataRoute } from "next";
import { getDocumentation, getLearning } from "@/lib/content";
import { getSiteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const lastModified = new Date();

  const pages = [
    { path: "", priority: 1 },
    { path: "/documentacion", priority: 0.9 },
    { path: "/aprender", priority: 0.9 },
    { path: "/experto", priority: 0.7 },
    ...getDocumentation().map((item) => ({
      path: `/documentacion/${item.slug}`,
      priority: 0.8,
    })),
    ...getLearning().map((item) => ({
      path: `/aprender/${item.slug}`,
      priority: 0.8,
    })),
  ];

  return pages.map((page) => ({
    url: `${base}${page.path}`,
    lastModified,
    changeFrequency: "weekly",
    priority: page.priority,
  }));
}

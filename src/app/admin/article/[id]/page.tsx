import { notFound } from "next/navigation";
import { getArticleById, getCategoriesData } from "@/lib/data";
import AdminEditor from "./AdminEditor";

export default async function AdminArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = getArticleById(id);
  if (!article) notFound();

  const categories = getCategoriesData().categories;

  return (
    <AdminEditor
      initialArticle={JSON.parse(JSON.stringify(article))}
      allCategories={categories}
    />
  );
}
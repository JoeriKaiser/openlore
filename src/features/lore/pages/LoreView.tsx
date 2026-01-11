import { useParams } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { EntityView } from "@/components/entity/EntityView";
import { useLoreDetail } from "../hooks";

export function LoreViewPage() {
  const { id } = useParams<{ id: string }>();
  const loreId = Number(id);
  const { data, isLoading, error } = useLoreDetail(loreId);

  return (
    <EntityView
      title={data?.title ?? ""}
      pageTitle="Lore Entry"
      icon={BookOpen}
      basePath="/app/lore"
      id={loreId}
      createdAt={data?.createdAt ?? ""}
      updatedAt={data?.updatedAt ?? ""}
      isLoading={isLoading}
      error={error}
      content={
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <div className="whitespace-pre-wrap text-base leading-relaxed">
            {data?.content}
          </div>
        </div>
      }
      stats={
        data
          ? [
              {
                label: "Word count",
                value: data.content.split(/\s+/).filter(Boolean).length,
              },
            ]
          : []
      }
    />
  );
}

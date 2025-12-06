import { useParams } from "react-router-dom";
import { User } from "lucide-react";
import { EntityView } from "@/components/entity/EntityView";
import { useCharacterDetail } from "../hooks";

export function CharacterViewPage() {
  const { id } = useParams<{ id: string }>();
  const characterId = Number(id);
  const { data, isLoading, error } = useCharacterDetail(characterId);

  return (
    <EntityView
      title={data?.name ?? ""}
      pageTitle="Character Profile"
      icon={User}
      basePath="/app/characters"
      id={characterId}
      createdAt={data?.createdAt ?? ""}
      updatedAt={data?.updatedAt ?? ""}
      isLoading={isLoading}
      error={error}
      content={
        data?.bio ? (
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-base leading-relaxed">{data.bio}</div>
          </div>
        ) : (
          <p className="text-muted-foreground italic">No bio provided</p>
        )
      }
      stats={data?.bio ? [{ label: "Word count", value: data.bio.split(/\s+/).filter(Boolean).length }] : []}
    />
  );
}

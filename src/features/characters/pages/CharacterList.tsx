import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCharacterList } from "../hooks/use-character-queries";

export function CharacterListPage() {
  const { data: items = [], isLoading, error } = useCharacterList();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter((c) => {
      const hay = (c.name + " " + (c.bio ?? "")).toLowerCase();
      return hay.includes(term);
    });
  }, [q, items]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <div className="text-sm text-muted-foreground">Loading characters...</div>
        </div>
      </div>
    );
  }

  if (error) {
    const msg = (error as any)?.message || "Failed to load characters";
    return (
      <div className="p-4">
        <div className="rounded-md bg-destructive/10 p-3 border border-destructive/20">
          <p className="text-sm text-destructive">{msg}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Characters</h1>
        <Link to="/app/characters/new">
          <Button>New character</Button>
        </Link>
      </div>
      <Input placeholder="Search characters..." value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="grid grid-cols-1 gap-3">
        {filtered.map((c) => (
          <Card key={c.id} className="p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Link to={`/app/characters/${c.id}`} className="text-base font-medium hover:underline">
                  {c.name}
                </Link>
              </div>
              <Link to={`/app/characters/${c.id}/edit`}>
                <Button size="sm" variant="outline">
                  Edit
                </Button>
              </Link>
            </div>
            {c.bio && <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{c.bio}</p>}
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-sm text-muted-foreground">No characters yet.</p>}
      </div>
    </div>
  );
}

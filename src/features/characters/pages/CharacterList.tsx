// src/features/characters/pages/CharacterList.tsx
import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useCharacterList } from "../hooks/use-character-queries"

export function CharacterListPage() {
  const { data: items = [], isLoading, error } = useCharacterList()
  const [query, setQuery] = useState("")

  const filteredItems = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return items
    return items.filter((character) => {
      const searchText = (character.name + " " + (character.bio ?? "")).toLowerCase()
      return searchText.includes(term)
    })
  }, [query, items])

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center space-x-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <div className="text-sm text-muted-foreground">Loading characters...</div>
        </div>
      </div>
    )
  }

  if (error) {
    const errorMessage = (error as any)?.message || "Failed to load characters"
    return (
      <div className="container mx-auto py-8">
        <div className="rounded-lg bg-destructive/10 p-4 border border-destructive/20">
          <p className="text-sm text-destructive">{errorMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Characters</h1>
          <p className="text-muted-foreground">Manage your character database</p>
        </div>
        <Link to="/app/characters/new">
          <Button>New Character</Button>
        </Link>
      </div>

      <div className="relative">
        <Input
          placeholder="Search characters by name or bio..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="grid gap-4">
        {filteredItems.map((character) => (
          <Card key={character.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-lg">
                    <Link 
                      to={`/app/characters/${character.id}`} 
                      className="hover:text-primary transition-colors"
                    >
                      {character.name}
                    </Link>
                  </CardTitle>
                  {character.bio && (
                    <CardDescription className="line-clamp-2">
                      {character.bio}
                    </CardDescription>
                  )}
                </div>
                <Link to={`/app/characters/${character.id}/edit`}>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </Link>
              </div>
            </CardHeader>
          </Card>
        ))}
        
        {filteredItems.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-muted-foreground">
                {items.length === 0 ? (
                  <>
                    <p className="font-medium">No characters yet</p>
                    <p className="text-sm mt-1">Get started by creating your first character</p>
                  </>
                ) : (
                  <p>No characters match your search</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

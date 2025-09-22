// src/features/lore/pages/LoreList.tsx
import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useLoreList } from "../hooks/use-lore-queries"

export function LoreListPage() {
  const { data: entries = [], isLoading, error } = useLoreList()
  const [query, setQuery] = useState("")

  const filteredEntries = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return entries
    return entries.filter((entry) => {
      const searchText = (entry.title + " " + entry.content).toLowerCase()
      return searchText.includes(term)
    })
  }, [query, entries])

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center space-x-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <div className="text-sm text-muted-foreground">Loading lore entries...</div>
        </div>
      </div>
    )
  }

  if (error) {
    const errorMessage = (error as any)?.message || "Failed to load lore entries"
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
          <h1 className="text-2xl font-bold tracking-tight">Lore Entries</h1>
          <p className="text-muted-foreground">Manage your world's lore and stories</p>
        </div>
        <Link to="/app/lore/new">
          <Button>New Entry</Button>
        </Link>
      </div>

      <div className="relative">
        <Input
          placeholder="Search lore entries by title or content..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="grid gap-4">
        {filteredEntries.map((entry) => (
          <Card key={entry.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-lg">
                    <Link 
                      to={`/app/lore/${entry.id}`} 
                      className="hover:text-primary transition-colors"
                    >
                      {entry.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {entry.content}
                  </CardDescription>
                </div>
                <Link to={`/app/lore/${entry.id}/edit`}>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </Link>
              </div>
            </CardHeader>
          </Card>
        ))}
        
        {filteredEntries.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-muted-foreground">
                {entries.length === 0 ? (
                  <>
                    <p className="font-medium">No lore entries yet</p>
                    <p className="text-sm mt-1">Start building your world's story</p>
                  </>
                ) : (
                  <p>No entries match your search</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

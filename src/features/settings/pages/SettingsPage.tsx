import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordInput } from "@/components/ui/password-input";
import { aiApi } from "@/lib/api";
import { queryKeys } from "@/lib/query-client";

export function SettingsPage() {
  const qc = useQueryClient();
  const [key, setKey] = useState("");

  const { data: status, isLoading } = useQuery({
    queryKey: queryKeys.ai.keyStatus,
    queryFn: aiApi.getKeyStatus,
  });

  const saveKey = useMutation({
    mutationFn: (k: string) => aiApi.setKey(k),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.ai.keyStatus });
      setKey("");
      toast.success("API key saved");
    },
    onError: (err) => toast.error(err.message),
  });

  const removeKey = useMutation({
    mutationFn: () => aiApi.deleteKey(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.ai.keyStatus });
      toast.success("API key removed");
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>OpenRouter API Key</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? "Loading..."
              : status?.exists
                ? `Key ending with ${status.last4}`
                : "No key set"}
          </p>
          <div className="flex gap-2">
            <PasswordInput
              placeholder="sk-or-v1-..."
              value={key}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setKey(e.target.value)
              }
            />
            <Button
              onClick={() => saveKey.mutate(key)}
              disabled={!key || saveKey.isPending}
            >
              {saveKey.isPending ? "Saving..." : "Save"}
            </Button>
            {status?.exists && (
              <Button
                variant="outline"
                onClick={() => removeKey.mutate()}
                disabled={removeKey.isPending}
              >
                {removeKey.isPending ? "..." : "Remove"}
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Your key is encrypted and used to call models via OpenRouter.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

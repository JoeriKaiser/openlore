import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { aiApi } from "@/lib/api";
import { queryKeys } from "@/lib/query-client";

export function SettingsPage() {
	const qc = useQueryClient();
	const { data: status, isLoading } = useQuery({
		queryKey: queryKeys.ai.keyStatus,
		queryFn: aiApi.getKeyStatus,
	});
	const [key, setKey] = useState("");

	useEffect(() => {
		setKey("");
	}, [status?.exists]);

	const saveKey = useMutation({
		mutationFn: (k: string) => aiApi.setKey(k),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: queryKeys.ai.keyStatus });
			setKey("");
		},
	});

	const removeKey = useMutation({
		mutationFn: () => aiApi.deleteKey(),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: queryKeys.ai.keyStatus });
		},
	});

	return (
		<div className="mx-auto max-w-2xl space-y-4">
			<Card>
				<CardHeader>
					<CardTitle>OpenRouter API Key</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="text-sm text-muted-foreground">
						{isLoading
							? "Loading..."
							: status?.exists
								? `Key is set • ending with ${status.last4}`
								: "No key set"}
					</div>
					<div className="flex items-center gap-2">
						<Input
							type="password"
							placeholder="sk-or-v1-..."
							value={key}
							onChange={(e) => setKey(e.target.value)}
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
								{removeKey.isPending ? "Removing..." : "Remove"}
							</Button>
						)}
					</div>
					<div className="text-xs text-muted-foreground">
						Your key is encrypted and stored securely. It will be used to call
						models via OpenRouter.
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ChatItem = {
	id: number;
	title?: string;
	model: string;
};

type Props = {
	chats: ChatItem[];
	selectedChatId: number | null;
	search: string;
	setSearch: (v: string) => void;

	showSidebar: boolean;
	setShowSidebar: (v: boolean) => void;

	keyExists: boolean;
	onNewChat: () => void;
	onSelectChat: (id: number) => void;
	onDeleteChat: (id: number) => void;
	onOpenContext: () => void;
};

export function ChatSidebar({
	chats,
	selectedChatId,
	search,
	setSearch,
	showSidebar,
	setShowSidebar,
	keyExists,
	onNewChat,
	onSelectChat,
	onDeleteChat,
	onOpenContext,
}: Props) {
	const filtered = (() => {
		const q = search.trim().toLowerCase();
		if (!q) return chats;
		return chats.filter((c) => {
			const t = (c.title || `Chat ${c.id}`).toLowerCase();
			const m = c.model.toLowerCase();
			return t.includes(q) || m.includes(q);
		});
	})();

	return (
		<>
			{/* Desktop */}
			<aside className="hidden h-full w-72 shrink-0 border-r md:flex md:flex-col">
				<div className="flex items-center gap-2 p-3">
					<Input
						placeholder="Search chats…"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="text-sm"
					/>
					<Button size="sm" onClick={onNewChat} className="shrink-0">
						New
					</Button>
				</div>
				<div className="flex-1 overflow-auto">
					{filtered.length === 0 ? (
						<div className="p-3 text-sm text-muted-foreground">
							{chats.length === 0
								? "No chats yet. Start a new one."
								: "No matches."}
						</div>
					) : (
						<ul className="p-2">
							{filtered.map((c) => {
								const isActive = selectedChatId === c.id;
								return (
									<li key={c.id}>
										<button
											className={`group flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-accent/60 ${
												isActive ? "bg-accent" : ""
											}`}
											onClick={() => onSelectChat(c.id)}
											title={c.title || `Chat ${c.id}`}
											aria-current={isActive ? "page" : undefined}
										>
											<span className="truncate">
												{c.title || `Chat ${c.id}`}{" "}
												<span className="text-muted-foreground">
													· {c.model}
												</span>
											</span>
											<span
												className="ml-2 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive"
												onClick={(e) => {
													e.stopPropagation();
													const ok = window.confirm("Delete this chat?");
													if (ok) onDeleteChat(c.id);
												}}
												role="button"
												aria-label="Delete chat"
											>
												×
											</span>
										</button>
									</li>
								);
							})}
						</ul>
					)}
				</div>
				<div className="flex items-center justify-between gap-2 border-t p-3">
					<div className="text-xs text-muted-foreground">
						{keyExists ? "API key set" : "No API key"}
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={onOpenContext}
						title="Open conversation context"
					>
						Context
					</Button>
				</div>
			</aside>

			{/* Mobile drawer */}
			{showSidebar && (
				<div className="fixed inset-0 z-40 md:hidden">
					<div
						className="absolute inset-0 bg-black/40"
						onClick={() => setShowSidebar(false)}
					/>
					<div className="absolute left-0 top-0 flex h-full w-[85%] max-w-[320px] flex-col bg-background shadow-xl">
						<div className="flex items-center gap-2 border-b p-3">
							<Input
								placeholder="Search chats…"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="text-sm"
							/>
							<Button
								size="sm"
								onClick={() => {
									setShowSidebar(false);
									onNewChat();
								}}
							>
								New
							</Button>
						</div>
						<div className="flex-1 overflow-auto">
							{filtered.length === 0 ? (
								<div className="p-3 text-sm text-muted-foreground">
									{chats.length === 0
										? "No chats yet. Start a new one."
										: "No matches."}
								</div>
							) : (
								<ul className="p-2">
									{filtered.map((c) => {
										const isActive = selectedChatId === c.id;
										return (
											<li key={c.id}>
												<button
													className={`group flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-accent/60 ${
														isActive ? "bg-accent" : ""
													}`}
													onClick={() => {
														onSelectChat(c.id);
														setShowSidebar(false);
													}}
													title={c.title || `Chat ${c.id}`}
													aria-current={isActive ? "page" : undefined}
												>
													<span className="truncate">
														{c.title || `Chat ${c.id}`}{" "}
														<span className="text-muted-foreground">
															· {c.model}
														</span>
													</span>
													<span
														className="ml-2 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive"
														onClick={(e) => {
															e.stopPropagation();
															const ok = window.confirm("Delete this chat?");
															if (ok) onDeleteChat(c.id);
														}}
														role="button"
														aria-label="Delete chat"
													>
														×
													</span>
												</button>
											</li>
										);
									})}
								</ul>
							)}
						</div>
						<div className="flex items-center justify-between gap-2 border-t p-3">
							<div className="text-xs text-muted-foreground">
								{keyExists ? "API key set" : "No API key"}
							</div>
							<Button
								variant="outline"
								size="sm"
								onClick={() => {
									setShowSidebar(false);
									onOpenContext();
								}}
							>
								Context
							</Button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}

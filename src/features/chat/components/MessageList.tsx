import type { Message } from "@/features/chat/types";

type Props = {
	messages: Message[];
	listRef: React.RefObject<HTMLDivElement>;
	onScroll: () => void;
};

export function MessageList({ messages, listRef, onScroll }: Props) {
	return (
		<div ref={listRef} onScroll={onScroll} className="flex-1 overflow-auto">
			<div className="mx-auto w-full max-w-3xl px-3 py-4 md:px-6">
				{messages.length === 0 ? (
					<div className="text-sm text-muted-foreground">
						Start a conversation by sending a message.
						<div className="mt-2">
							Tips:
							<ul className="ml-5 list-disc">
								<li>Shift+Enter for a new line</li>
								<li>Esc to stop streaming</li>
								<li>Ctrl/Cmd+K to open Context</li>
							</ul>
						</div>
					</div>
				) : (
					<ul className="space-y-3">
						{messages.map((m) => {
							const isUser = m.role === "user";
							return (
								<li key={m.id} className="w-full">
									<div
										className={`flex w-full ${
											isUser ? "justify-end" : "justify-start"
										}`}
									>
										<div
											className={`max-w-full whitespace-pre-wrap break-words text-[0.95rem] leading-7 ${
												isUser
													? "bg-primary/10 text-foreground"
													: "text-foreground"
											} rounded-md px-3 py-2`}
											style={{ lineHeight: 1.6 }}
										>
											{m.content}
										</div>
									</div>
								</li>
							);
						})}
					</ul>
				)}
			</div>
		</div>
	);
}

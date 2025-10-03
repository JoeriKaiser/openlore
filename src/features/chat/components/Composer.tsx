import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Props = {
	value: string;
	onChange: (v: string) => void;
	onSend: () => void;
	onStop: () => void;
	onNewChat: () => void;
	onDeleteChat?: () => void;

	isStreaming: boolean;
	disabled: boolean;
	selectedChatId: number | null;

	metaLeft?: React.ReactNode;
	metaRight?: React.ReactNode;
};

export function Composer({
	value,
	onChange,
	onSend,
	onStop,
	onNewChat,
	onDeleteChat,
	isStreaming,
	disabled,
	selectedChatId,
	metaLeft,
	metaRight,
}: Props) {
	return (
		<div className="border-t p-3 mb-2 pb-[env(safe-area-inset-bottom)]">
			<div className="mx-auto w-full max-w-3xl">
				{metaLeft && (
					<div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
						{metaLeft}
					</div>
				)}

				<div className="grid grid-cols-1 gap-2">
					<Textarea
						rows={3}
						placeholder="Type your message…"
						value={value}
						onChange={(e) => onChange(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								onSend();
							}
						}}
						disabled={disabled}
					/>
					<div className="flex items-center gap-2">
						<Button onClick={onSend} disabled={disabled}>
							{isStreaming ? "Streaming…" : "Send"}
						</Button>
						{isStreaming && (
							<Button variant="outline" onClick={onStop}>
								Stop
							</Button>
						)}
						<Button variant="outline" onClick={onNewChat}>
							New chat
						</Button>
						{selectedChatId && onDeleteChat && (
							<Button variant="outline" onClick={onDeleteChat}>
								Delete chat
							</Button>
						)}
						{metaRight && (
							<div className="ml-auto hidden md:flex">{metaRight}</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

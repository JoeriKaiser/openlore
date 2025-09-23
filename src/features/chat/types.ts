export type Chat = {
	id: number;
	title: string | null;
	model: string;
	characterId: number | null;
	createdAt: string;
	updatedAt: string;
};

export type Message = {
	id: number;
	role: "user" | "assistant";
	content: string;
	createdAt: string;
};

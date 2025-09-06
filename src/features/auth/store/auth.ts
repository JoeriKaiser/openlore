import { nanoid } from "nanoid";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { sha256Hex } from "@/lib/auth-crypto";

export type User = {
	id: string;
	email: string;
	username: string;
};

type Account = User & { passwordHash: string };

type State = {
	user: User | null;
	accounts: Record<string, Account>;
};

type Actions = {
	register: (p: {
		email: string;
		username: string;
		password: string;
	}) => Promise<void>;
	login: (p: { email: string; password: string }) => Promise<void>;
	logout: () => void;
};

export const useAuthStore = create<State & Actions>()(
	persist(
		(set, get) => ({
			user: null,
			accounts: {},
			register: async ({ email, username, password }) => {
				const accounts = get().accounts;
				if (accounts[email]) throw new Error("Email already registered");
				const passwordHash = await sha256Hex(password);
				const account: Account = {
					id: nanoid(),
					email,
					username,
					passwordHash,
				};
				set({ accounts: { ...accounts, [email]: account }, user: account });
			},
			login: async ({ email, password }) => {
				const account = get().accounts[email];
				if (!account) throw new Error("Account not found");
				const hash = await sha256Hex(password);
				if (account.passwordHash !== hash) throw new Error("Invalid password");
				set({ user: account });
			},
			logout: () => set({ user: null }),
		}),
		{ name: "openlore-auth" },
	),
);

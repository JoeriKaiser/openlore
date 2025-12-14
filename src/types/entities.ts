import type { BaseEntity } from "./api";

export interface Lore extends BaseEntity {
  title: string;
  content: string;
}

export interface Character extends BaseEntity {
  name: string;
  bio: string | null;
}

export interface Chat extends BaseEntity {
  title: string | null;
  model: string;
  characterId: number | null;
}

export interface Message {
  id: number;
  chatId?: number;
  userId?: string;
  role: string;
  content: string;
  reasoning?: string | null;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
}

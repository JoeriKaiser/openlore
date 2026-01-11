// config/models.ts

export interface ModelOption {
  id: string;
  label: string;
  description?: string;
  provider?: string;
}

export const CURATED_MODELS: ModelOption[] = [
  // OpenAI
  {
    id: "openai/chatgpt-4o-latest",
    label: "GPT-4o (latest)",
    description: "Everyone knows this one",
    provider: "OpenAI",
  },
  {
    id: "thedrummer/cydonia-24b-v4.1",
    label: "Cydonia 24B v4.1",
    description: "Creative writing",
    provider: "TheDrummer",
  },
  {
    id: "openai/gpt-4o-mini",
    label: "GPT-4o Mini",
    description: "Fast and affordable",
    provider: "OpenAI",
  },
  {
    id: "openai/gpt-4-turbo",
    label: "GPT-4 Turbo",
    description: "Previous generation flagship",
    provider: "OpenAI",
  },

  // Google
  {
    id: "google/gemini-2.5-flash",
    label: "Gemini 2.5 Flash",
    description: "Large context window",
    provider: "Google",
  },
  {
    id: "google/gemini-2.0-flash-001",
    label: "Gemini 2.0 Flash",
    description: "Fast multimodal model",
    provider: "Google",
  },


  // Mistral
  {
    id: "mistralai/mistral-nemo",
    label: "Mistral: Mistral Nemo",
    description: "Mistral creative writing model",
    provider: "Mistral",
  },

  // TNG
  {
    id: "tngtech/deepseek-r1t2-chimera:free",
    label: "TNG: Deepseek R1T2 Chimera",
    description: "A balanced model in the Deepseek R1T2 family",
    provider: "TNG",
  },
];

export const DEFAULT_MODEL = "openai/gpt-4o-mini";

// Helper to get model by id
export const getModelById = (id: string) => {
  return CURATED_MODELS.find((m) => m.id === id);
};

// Helper to group models by provider
export const getModelsByProvider = () => {
  return CURATED_MODELS.reduce(
    (acc, model) => {
      const provider = model.provider || "Other";
      if (!acc[provider]) {
        acc[provider] = [];
      }
      acc[provider].push(model);
      return acc;
    },
    {} as Record<string, ModelOption[]>,
  );
};

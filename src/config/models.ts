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
		id: "openai/gpt-4o",
		label: "GPT-4o",
		description: "Most capable OpenAI model",
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

	// Anthropic
	{
		id: "anthropic/claude-3.5-sonnet",
		label: "Claude 3.5 Sonnet",
		description: "Best for complex tasks",
		provider: "Anthropic",
	},
	{
		id: "anthropic/claude-3-opus",
		label: "Claude 3 Opus",
		description: "Most capable Claude model",
		provider: "Anthropic",
	},
	{
		id: "anthropic/claude-3-haiku",
		label: "Claude 3 Haiku",
		description: "Fast and efficient",
		provider: "Anthropic",
	},

	// Google
	{
		id: "google/gemini-pro-1.5",
		label: "Gemini 1.5 Pro",
		description: "Large context window",
		provider: "Google",
	},
	{
		id: "google/gemini-flash-1.5",
		label: "Gemini 1.5 Flash",
		description: "Fast multimodal model",
		provider: "Google",
	},

	// Meta
	{
		id: "meta-llama/llama-3.1-405b-instruct",
		label: "Llama 3.1 405B",
		description: "Largest open model",
		provider: "Meta",
	},
	{
		id: "meta-llama/llama-3.1-70b-instruct",
		label: "Llama 3.1 70B",
		description: "Balanced performance",
		provider: "Meta",
	},

	// Mistral
	{
		id: "mistralai/mistral-large",
		label: "Mistral Large",
		description: "Flagship Mistral model",
		provider: "Mistral",
	},
	{
		id: "mistralai/mistral-medium",
		label: "Mistral Medium",
		description: "Good balance of speed and quality",
		provider: "Mistral",
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

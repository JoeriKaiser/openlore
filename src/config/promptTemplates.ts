/**
 * Prompt templates for creative writing
 * These help guide users in structuring their prompts
 */

export interface PromptTemplate {
  id: string;
  label: string;
  description: string;
  template: string;
  icon: string;
}

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: "describe-scene",
    label: "Describe a Scene",
    description: "Paint a vivid picture of a setting or moment",
    template:
      "Describe the scene where [LOCATION/SITUATION]. Focus on [SENSORY DETAILS/ATMOSPHERE].",
    icon: "🎬",
  },
  {
    id: "dialogue",
    label: "Write Dialogue",
    description: "Create a conversation between characters",
    template:
      "Write a dialogue between [CHARACTER 1] and [CHARACTER 2] about [TOPIC/CONFLICT].",
    icon: "💬",
  },
  {
    id: "continue",
    label: "Continue the Story",
    description: "Pick up where you left off",
    template:
      "Continue from where [LAST EVENT]. The next thing that happens is [DIRECTION/HINT].",
    icon: "➡️",
  },
  {
    id: "introduce-character",
    label: "Introduce a Character",
    description: "Bring a new character into the narrative",
    template:
      "Introduce [CHARACTER NAME], a [BRIEF DESCRIPTION]. They enter the story by [ACTION/CIRCUMSTANCE].",
    icon: "👤",
  },
  {
    id: "build-tension",
    label: "Build Tension",
    description: "Increase suspense and stakes",
    template:
      "Build tension as [SITUATION DESCRIPTION]. Hint at [THREAT/DANGER] while [CHARACTER] [ACTION].",
    icon: "⚡",
  },
  {
    id: "action-sequence",
    label: "Action Sequence",
    description: "Write fast-paced action or conflict",
    template:
      "Write an action sequence where [CHARACTER(S)] must [GOAL]. The challenge is [OBSTACLE].",
    icon: "💥",
  },
  {
    id: "emotional-moment",
    label: "Emotional Moment",
    description: "Create a poignant or moving scene",
    template:
      "Write an emotional scene where [CHARACTER] experiences [EMOTION] because [REASON].",
    icon: "💔",
  },
  {
    id: "world-building",
    label: "World Building",
    description: "Expand on your setting's lore",
    template:
      "Describe the [ASPECT: culture/history/magic/technology] of [PLACE/SOCIETY]. Include [SPECIFIC DETAIL].",
    icon: "🌍",
  },
];

/**
 * Length options for generated content
 */
export interface LengthOption {
  id: string;
  label: string;
  description: string;
  wordRange: [number, number];
}

export const LENGTH_OPTIONS: LengthOption[] = [
  {
    id: "short",
    label: "Short",
    description: "A brief passage",
    wordRange: [100, 300],
  },
  {
    id: "paragraph",
    label: "Paragraph",
    description: "A standard paragraph",
    wordRange: [300, 500],
  },
  {
    id: "page",
    label: "Page",
    description: "About a page of text",
    wordRange: [500, 800],
  },
  {
    id: "extended",
    label: "Extended",
    description: "A longer passage",
    wordRange: [800, 1200],
  },
];

/**
 * Style options for generated content
 */
export interface StyleOption {
  id: string;
  label: string;
  description: string;
  systemPrompt: string;
}

export const STYLE_OPTIONS: StyleOption[] = [
  {
    id: "descriptive",
    label: "Descriptive",
    description: "Rich sensory details and vivid imagery",
    systemPrompt:
      "Write with rich, evocative descriptions. Focus on sensory details - sights, sounds, smells, textures. Paint vivid mental images for the reader.",
  },
  {
    id: "dialogue-heavy",
    label: "Dialogue-heavy",
    description: "Focus on character conversations",
    systemPrompt:
      "Prioritize dialogue and character interaction. Let conversations drive the narrative. Use dialogue to reveal character and advance plot.",
  },
  {
    id: "action-packed",
    label: "Action-packed",
    description: "Fast-paced and dynamic",
    systemPrompt:
      "Write with urgency and momentum. Use short, punchy sentences. Focus on movement, conflict, and immediate stakes.",
  },
  {
    id: "introspective",
    label: "Introspective",
    description: "Deep character thoughts and feelings",
    systemPrompt:
      "Explore internal landscapes. Focus on thoughts, memories, and emotional processing. Let the reader inside the character's mind.",
  },
  {
    id: "poetic",
    label: "Poetic",
    description: "Lyrical and literary language",
    systemPrompt:
      "Use literary language and poetic devices. Employ metaphor, rhythm, and careful word choice. Aim for prose that sings.",
  },
];

/**
 * Get a prompt template by ID
 */
export function getPromptTemplate(id: string): PromptTemplate | undefined {
  return PROMPT_TEMPLATES.find((t) => t.id === id);
}

/**
 * Get a length option by ID
 */
export function getLengthOption(id: string): LengthOption | undefined {
  return LENGTH_OPTIONS.find((l) => l.id === id);
}

/**
 * Get a style option by ID
 */
export function getStyleOption(id: string): StyleOption | undefined {
  return STYLE_OPTIONS.find((s) => s.id === id);
}

/**
 * Build a length instruction for the system prompt
 */
export function buildLengthInstruction(lengthId: string): string {
  const option = getLengthOption(lengthId);
  if (!option) return "";
  return `Aim for approximately ${option.wordRange[0]}-${option.wordRange[1]} words.`;
}

/**
 * Build a style instruction for the system prompt
 */
export function buildStyleInstruction(styleId: string): string {
  const option = getStyleOption(styleId);
  return option?.systemPrompt ?? "";
}

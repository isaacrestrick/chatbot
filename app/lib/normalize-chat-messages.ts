import type { UIMessage, TextUIPart } from "ai";

type NormalizeResult = {
  messages: UIMessage[];
  didNormalize: boolean;
};

export function normalizeChatMessages(raw: unknown): NormalizeResult {
  if (!Array.isArray(raw)) {
    return {
      messages: [],
      didNormalize: raw !== undefined && raw !== null,
    };
  }

  let didNormalize = false;

  const normalized = raw
    .map((entry, index) => {
      if (!isPlainObject(entry)) {
        didNormalize = true;
        return null;
      }

      const id =
        typeof entry.id === "string" && entry.id.trim().length > 0
          ? entry.id
          : generateMessageId(index);
      if (id !== entry.id) {
        didNormalize = true;
      }

      const role =
        entry.role === "assistant" || entry.role === "user" || entry.role === "system"
          ? entry.role
          : "assistant";
      if (role !== entry.role) {
        didNormalize = true;
      }

      const { parts, mutated } = extractParts(entry);
      if (mutated) {
        didNormalize = true;
      }

      let normalizedParts = parts;
      if (!Array.isArray(normalizedParts) || normalizedParts.length === 0) {
        normalizedParts = [createTextPart("")];
        didNormalize = true;
      }

      const metadata = isPlainObject(entry.metadata)
        ? entry.metadata
        : undefined;
      if (entry.metadata !== undefined && metadata === undefined) {
        didNormalize = true;
      }

      return metadata !== undefined
        ? ({ id, role, parts: normalizedParts, metadata } satisfies UIMessage)
        : ({ id, role, parts: normalizedParts } satisfies UIMessage);
    })
    .filter(Boolean) as UIMessage[];

  return { messages: normalized, didNormalize };
}

function extractParts(entry: Record<string, unknown>): {
  parts: UIMessage["parts"];
  mutated: boolean;
} {
  if (Array.isArray(entry.parts)) {
    return {
      parts: entry.parts as UIMessage["parts"],
      mutated: false,
    };
  }

  const legacyCandidates = [
    entry.content,
    (entry as { message?: unknown }).message,
    (entry as { text?: unknown }).text,
  ];

  for (const candidate of legacyCandidates) {
    const converted = convertLegacyParts(candidate);
    if (converted) {
      return { parts: converted, mutated: true };
    }
  }

  return {
    parts: [createTextPart("")],
    mutated: true,
  };
}

function convertLegacyParts(candidate: unknown): UIMessage["parts"] | null {
  if (candidate === undefined || candidate === null) {
    return null;
  }

  if (Array.isArray(candidate)) {
    const parts = candidate
      .map(convertLegacyPartToText)
      .filter(Boolean) as UIMessage["parts"];
    if (parts.length > 0) {
      return parts;
    }
  }

  if (typeof candidate === "string") {
    return [createTextPart(candidate)];
  }

  if (isPlainObject(candidate)) {
    const text = readTextish(candidate);
    if (text !== null) {
      return [createTextPart(text)];
    }
  }

  const fallback = safeStringify(candidate);
  if (fallback) {
    return [createTextPart(fallback)];
  }

  return null;
}

function convertLegacyPartToText(part: unknown): TextUIPart | null {
  if (part === undefined || part === null) {
    return null;
  }

  if (typeof part === "string") {
    return createTextPart(part);
  }

  if (isPlainObject(part)) {
    const text = readTextish(part);
    if (text !== null) {
      return createTextPart(text);
    }
  }

  const fallback = safeStringify(part);
  return fallback ? createTextPart(fallback) : null;
}

function readTextish(value: Record<string, unknown>): string | null {
  if (typeof value.text === "string") {
    return value.text;
  }
  if (typeof value.content === "string") {
    return value.content;
  }
  if (typeof value.value === "string") {
    return value.value;
  }
  if (typeof value.message === "string") {
    return value.message;
  }
  if (typeof value.body === "string") {
    return value.body;
  }
  if (typeof value.result === "string") {
    return value.result;
  }
  return null;
}

function createTextPart(text: string): TextUIPart {
  return { type: "text", text };
}

function safeStringify(value: unknown): string | null {
  if (value === undefined || value === null) {
    return null;
  }
  if (typeof value === "string") {
    return value;
  }
  try {
    const result = JSON.stringify(value, null, 2);
    return result === undefined ? null : result;
  } catch {
    return null;
  }
}

function generateMessageId(index: number): string {
  const fallback = `legacy-${Date.now().toString(36)}-${index.toString(36)}-${Math.random()
    .toString(16)
    .slice(2)}`;

  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    try {
      return crypto.randomUUID();
    } catch {
      return fallback;
    }
  }

  return fallback;
}

function isPlainObject(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

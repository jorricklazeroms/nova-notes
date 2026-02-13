import type { Note } from "../types";

const STORAGE_VERSION = 1;

type SerializedNotesV1 = {
  version: number;
  notes: Note[];
};

export const normalizeTags = (tags: string[]): string[] => {
  const cleaned = tags
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag.length > 0);

  return Array.from(new Set(cleaned));
};

export const parseTagsInput = (value: string): string[] => {
  return normalizeTags(value.split(","));
};

export const serializeNotes = (notes: Note[]): string => {
  const payload: SerializedNotesV1 = {
    version: STORAGE_VERSION,
    notes
  };

  return JSON.stringify(payload);
};

const isNote = (value: unknown): value is Note => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Note;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.content === "string" &&
    typeof candidate.updatedAt === "string" &&
    Array.isArray(candidate.tags) &&
    candidate.tags.every((tag) => typeof tag === "string")
  );
};

export const deserializeNotes = (raw: string | null): Note[] => {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as { version?: number; notes?: unknown };
    if (parsed.version !== STORAGE_VERSION || !Array.isArray(parsed.notes)) {
      return [];
    }

    return parsed.notes
      .filter(isNote)
      .map((note) => ({ ...note, tags: normalizeTags(note.tags) }));
  } catch {
    return [];
  }
};

export const createEmptyNote = (): Note => {
  const now = new Date().toISOString();
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
    title: "Untitled note",
    content: "",
    tags: [],
    updatedAt: now
  };
};

const frontmatterLine = (key: string, value: string): string => `${key}: ${value}`;

export const exportNoteAsMarkdown = (note: Note): string => {
  const frontmatter = [
    "---",
    frontmatterLine("title", note.title),
    frontmatterLine("updatedAt", note.updatedAt),
    frontmatterLine("tags", note.tags.join(", ")),
    "---"
  ].join("\n");

  return `${frontmatter}\n\n${note.content}`;
};

const extractFrontmatter = (
  markdown: string
): { metadata: Record<string, string>; body: string } => {
  const lines = markdown.split(/\r?\n/);
  if (lines[0] !== "---") {
    return { metadata: {}, body: markdown };
  }

  const endIdx = lines.indexOf("---", 1);
  if (endIdx === -1) {
    return { metadata: {}, body: markdown };
  }

  const metadata: Record<string, string> = {};
  const metaLines = lines.slice(1, endIdx);
  for (const line of metaLines) {
    const sepIndex = line.indexOf(":");
    if (sepIndex === -1) {
      continue;
    }

    const key = line.slice(0, sepIndex).trim();
    const value = line.slice(sepIndex + 1).trim();
    metadata[key] = value;
  }

  return { metadata, body: lines.slice(endIdx + 1).join("\n").trimStart() };
};

export const importNoteFromMarkdown = (markdown: string): Note => {
  const { metadata, body } = extractFrontmatter(markdown);
  const imported = createEmptyNote();

  return {
    ...imported,
    title: metadata.title || imported.title,
    updatedAt: metadata.updatedAt || new Date().toISOString(),
    tags: metadata.tags ? parseTagsInput(metadata.tags) : [],
    content: body
  };
};

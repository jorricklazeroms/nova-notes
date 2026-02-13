import { describe, expect, it } from "vitest";
import { deserializeNotes, normalizeTags, serializeNotes } from "../src/lib/notes";
import type { Note } from "../src/types";

describe("notes serialization", () => {
  it("roundtrips serialized notes", () => {
    const notes: Note[] = [
      {
        id: "a1",
        title: "My note",
        content: "# Hello",
        tags: ["roadmap", "demo"],
        updatedAt: "2026-02-11T10:00:00.000Z"
      }
    ];

    const serialized = serializeNotes(notes);
    const parsed = deserializeNotes(serialized);

    expect(parsed).toEqual(notes);
  });
});

describe("tag normalization", () => {
  it("trims, lowercases and deduplicates", () => {
    expect(normalizeTags(["  API", "api", " ux ", "", "UX"])).toEqual(["api", "ux"]);
  });
});

import { useMemo, useRef, useState } from "react";
import {
  createEmptyNote,
  deserializeNotes,
  exportNoteAsMarkdown,
  importNoteFromMarkdown,
  parseTagsInput,
  serializeNotes
} from "./lib/notes";
import { renderMarkdown } from "./lib/markdown";
import type { Note } from "./types";
import "./styles.css";

const STORAGE_KEY = "nova-notes-v1";

const downloadFile = (fileName: string, content: string): void => {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
};

const formatDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleString();
};

function App() {
  const [notes, setNotes] = useState<Note[]>(() => {
    return deserializeNotes(localStorage.getItem(STORAGE_KEY));
  });
  const [activeId, setActiveId] = useState<string | null>(notes[0]?.id ?? null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const activeNote = useMemo(() => {
    return notes.find((note) => note.id === activeId) ?? null;
  }, [notes, activeId]);

  const persistNotes = (nextNotes: Note[], nextActiveId: string | null): void => {
    setNotes(nextNotes);
    setActiveId(nextActiveId);
    localStorage.setItem(STORAGE_KEY, serializeNotes(nextNotes));
  };

  const upsertActiveNote = (changes: Partial<Omit<Note, "id">>): void => {
    if (!activeNote) {
      return;
    }

    const updated: Note = {
      ...activeNote,
      ...changes,
      updatedAt: new Date().toISOString()
    };

    const nextNotes = notes.map((note) => (note.id === activeNote.id ? updated : note));
    persistNotes(nextNotes, activeNote.id);
  };

  const addNote = (): void => {
    const note = createEmptyNote();
    persistNotes([note, ...notes], note.id);
  };

  const deleteNote = (noteId: string): void => {
    const filtered = notes.filter((note) => note.id !== noteId);
    const nextActiveId = activeId === noteId ? filtered[0]?.id ?? null : activeId;
    persistNotes(filtered, nextActiveId);
  };

  const handleImportClick = (): void => {
    importInputRef.current?.click();
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const content = await file.text();
    const importedNote = importNoteFromMarkdown(content);
    const nextNotes = [importedNote, ...notes];
    persistNotes(nextNotes, importedNote.id);
    event.target.value = "";
  };

  const handleExport = (): void => {
    if (!activeNote) {
      return;
    }

    const safeTitle = activeNote.title.trim().toLowerCase().replace(/\s+/g, "-") || "note";
    downloadFile(`${safeTitle}.md`, exportNoteAsMarkdown(activeNote));
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <header className="sidebar-header">
          <h1>Nova Notes</h1>
          <div className="sidebar-actions">
            <button onClick={addNote}>New</button>
            <button onClick={handleImportClick}>Import .md</button>
            <input
              type="file"
              accept=".md,text/markdown"
              ref={importInputRef}
              onChange={handleImportFile}
              hidden
            />
          </div>
        </header>

        {notes.length === 0 ? <p className="hint">No notes yet. Create or import one.</p> : null}

        <ul className="notes-list">
          {notes.map((note) => {
            const isActive = note.id === activeId;
            return (
              <li key={note.id} className={isActive ? "note-item active" : "note-item"}>
                <button className="note-select" onClick={() => setActiveId(note.id)}>
                  <strong>{note.title}</strong>
                  <span>{formatDate(note.updatedAt)}</span>
                </button>
                <button className="danger" onClick={() => deleteNote(note.id)}>
                  Delete
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <main className="main-panel">
        {!activeNote ? (
          <section className="empty-state">Select or create a note.</section>
        ) : (
          <>
            <section className="meta-row">
              <input
                aria-label="Note title"
                value={activeNote.title}
                onChange={(event) => upsertActiveNote({ title: event.target.value })}
                placeholder="Title"
              />
              <input
                aria-label="Note tags"
                value={activeNote.tags.join(", ")}
                onChange={(event) => upsertActiveNote({ tags: parseTagsInput(event.target.value) })}
                placeholder="Tags (comma-separated)"
              />
              <button onClick={handleExport}>Export .md</button>
            </section>

            <section className="split-view">
              <div className="panel">
                <h2>Editor</h2>
                <textarea
                  value={activeNote.content}
                  onChange={(event) => upsertActiveNote({ content: event.target.value })}
                  placeholder="Write markdown here"
                />
              </div>
              <div className="panel">
                <h2>Preview</h2>
                <article
                  className="preview"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(activeNote.content) }}
                />
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default App;

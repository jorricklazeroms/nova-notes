const escapeHtml = (input: string): string =>
  input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const inline = (text: string): string => {
  return text
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
};

const renderLine = (line: string): string => {
  if (line.startsWith("### ")) {
    return `<h3>${inline(escapeHtml(line.slice(4)))}</h3>`;
  }

  if (line.startsWith("## ")) {
    return `<h2>${inline(escapeHtml(line.slice(3)))}</h2>`;
  }

  if (line.startsWith("# ")) {
    return `<h1>${inline(escapeHtml(line.slice(2)))}</h1>`;
  }

  if (line.startsWith("- ")) {
    return `<li>${inline(escapeHtml(line.slice(2)))}</li>`;
  }

  return `<p>${inline(escapeHtml(line))}</p>`;
};

export const renderMarkdown = (markdown: string): string => {
  const lines = markdown.split(/\r?\n/);
  const chunks: string[] = [];
  let listBuffer: string[] = [];

  const flushList = (): void => {
    if (listBuffer.length === 0) {
      return;
    }

    chunks.push(`<ul>${listBuffer.join("")}</ul>`);
    listBuffer = [];
  };

  for (const line of lines) {
    if (line.trim().length === 0) {
      flushList();
      continue;
    }

    if (line.startsWith("- ")) {
      listBuffer.push(renderLine(line));
      continue;
    }

    flushList();
    chunks.push(renderLine(line));
  }

  flushList();

  return chunks.join("\n");
};

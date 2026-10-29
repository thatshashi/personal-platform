export function renderMarkdownToHtml(markdown: string): string {
  if (!markdown) return '';

  const lines = markdown.split('\n');
  const htmlChunks: string[] = [];
  let inCodeBlock = false;
  let codeBlockLanguage = '';
  let codeBuffer: string[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Handle code blocks
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End of code block
        const escapedCode = codeBuffer
          .join('\n')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        htmlChunks.push(`<pre><code class="language-${codeBlockLanguage}">${escapedCode}</code></pre>`);
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        // Start of code block
        inCodeBlock = true;
        codeBlockLanguage = line.trim().replace(/^```/, '');
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Close open list if line is empty or not a list item
    if (inList && !line.trim().startsWith('- ') && !line.trim().match(/^\d+\.\s/)) {
      htmlChunks.push('</ul>');
      inList = false;
    }

    // Blank line
    if (!line.trim()) {
      continue;
    }

    // Headings
    if (line.startsWith('### ')) {
      htmlChunks.push(`<h3 style="margin: 2rem 0 0.75rem; font-size: 1.35rem; color: var(--text-primary);">${formatInline(line.slice(4))}</h3>`);
      continue;
    }
    if (line.startsWith('## ')) {
      htmlChunks.push(`<h2 style="margin: 2.5rem 0 1rem; font-size: 1.7rem; color: var(--text-primary); border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.5rem;">${formatInline(line.slice(3))}</h2>`);
      continue;
    }
    if (line.startsWith('# ')) {
      htmlChunks.push(`<h1 style="margin: 3rem 0 1.25rem; font-size: 2.2rem; color: var(--text-primary);">${formatInline(line.slice(2))}</h1>`);
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      htmlChunks.push(`<blockquote style="border-left: 3px solid var(--accent-cyan); padding-left: 1rem; margin: 1.5rem 0; font-style: italic; color: var(--text-secondary); background: var(--bg-surface-elevated); padding: 1rem 1.25rem; border-radius: 0 8px 8px 0;">${formatInline(line.slice(2))}</blockquote>`);
      continue;
    }

    // Bulleted list item
    if (line.trim().startsWith('- ')) {
      if (!inList) {
        htmlChunks.push('<ul style="margin: 1rem 0 1.5rem 1.5rem; display: flex; flex-direction: column; gap: 0.5rem; color: var(--text-secondary); line-height: 1.7;">');
        inList = true;
      }
      htmlChunks.push(`<li>${formatInline(line.trim().slice(2))}</li>`);
      continue;
    }

    // Numbered list item
    const numMatch = line.trim().match(/^(\d+)\.\s(.*)$/);
    if (numMatch) {
      if (!inList) {
        htmlChunks.push('<ol style="margin: 1rem 0 1.5rem 1.5rem; display: flex; flex-direction: column; gap: 0.5rem; color: var(--text-secondary); line-height: 1.7;">');
        inList = true;
      }
      htmlChunks.push(`<li>${formatInline(numMatch[2])}</li>`);
      continue;
    }

    // Regular Paragraph
    htmlChunks.push(`<p style="margin-bottom: 1.5rem; color: var(--text-secondary); line-height: 1.8; font-size: 1.05rem;">${formatInline(line)}</p>`);
  }

  if (inList) {
    htmlChunks.push('</ul>');
  }

  return htmlChunks.join('\n');
}

function formatInline(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--text-primary);">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: var(--accent-cyan); text-decoration: underline;">$1</a>');
}

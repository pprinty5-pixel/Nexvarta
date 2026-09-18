export function renderRichContent(text) {
  if (!text) return '';

  let html = text;

  // Headings
  html = html.replace(/^### (.*$)/gim, '<h4 style="font-size: 1.15rem; font-weight: 800; color: #0f172a; margin: 20px 0 8px;">$1</h4>');
  html = html.replace(/^## (.*$)/gim, '<h3 style="font-size: 1.35rem; font-weight: 800; color: #0f172a; margin: 24px 0 10px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">$1</h3>');

  // Blockquotes
  html = html.replace(/^> (.*$)/gim, '<blockquote style="border-left: 4px solid #2563eb; background: #f8fafc; padding: 12px 18px; margin: 16px 0; font-style: italic; color: #1e293b; border-radius: 0 8px 8px 0; font-size: 1.05rem;">$1</blockquote>');

  // Horizontal divider
  html = html.replace(/^---$/gim, '<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />');

  // Bullet items
  html = html.replace(/^[•*-] (.*$)/gim, '<li style="margin-left: 24px; margin-bottom: 6px; list-style-type: disc;">$1</li>');
  // Numbered items
  html = html.replace(/^(\d+)\. (.*$)/gim, '<li style="margin-left: 24px; margin-bottom: 6px; list-style-type: decimal;">$2</li>');

  // Bold & Italic markdown
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Links [text](url)
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline; font-weight: 600;">$1</a>');

  // Wrap non-block lines into paragraphs
  const blocks = html.split(/\n{2,}/);
  html = blocks.map(block => {
    block = block.trim();
    if (!block) return '';
    if (
      block.startsWith('<h3') || 
      block.startsWith('<h4') || 
      block.startsWith('<blockquote') || 
      block.startsWith('<li') ||
      block.startsWith('<hr')
    ) {
      return block;
    }
    return `<p style="margin-bottom: 14px; line-height: 1.8;">${block.replace(/\n/g, '<br/>')}</p>`;
  }).join('');

  return html;
}

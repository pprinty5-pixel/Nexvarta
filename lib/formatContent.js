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

  // 1. Process Markdown Images: ![caption](url)
  const imagePlaceholders = [];
  html = html.replace(/!\[(.*?)\]\((.*?)\)/g, (match, caption, src) => {
    const idx = imagePlaceholders.length;
    imagePlaceholders.push(
      `<figure style="margin: 22px 0; text-align: center;"><img src="${src}" alt="${caption || 'बातमी फोटो'}" style="width: 100%; max-height: 520px; object-fit: cover; border-radius: 10px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); display: block;" />${caption ? `<figcaption style="font-size: 0.825rem; color: #64748b; margin-top: 8px; font-weight: 600; font-style: italic;">📷 ${caption}</figcaption>` : ''}</figure>`
    );
    return `__IMG_PH_${idx}__`;
  });

  // 2. Process standalone YouTube URLs: embed responsive video player
  const youtubePlaceholders = [];
  html = html.replace(/(?:^|\n)\s*(https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})[^\s<>'"]*)\s*(?:\n|$)/gi, (match, fullUrl, videoId) => {
    const idx = youtubePlaceholders.length;
    youtubePlaceholders.push(
      `<div class="news-youtube-embed" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; border-radius: 12px; margin: 24px 0; box-shadow: 0 4px 16px rgba(0,0,0,0.12);"><iframe src="https://www.youtube-nocookie.com/embed/${videoId}?rel=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 12px;"></iframe></div>`
    );
    return `\n\n__YT_PH_${idx}__\n\n`;
  });

  // 3. Protect existing HTML links: <a ...>...</a>
  const htmlLinkPlaceholders = [];
  html = html.replace(/<a\b[^>]*>([\s\S]*?)<\/a>/gi, (match) => {
    const idx = htmlLinkPlaceholders.length;
    htmlLinkPlaceholders.push(match);
    return `__HTML_LINK_PH_${idx}__`;
  });

  // 4. Process Markdown Links: [text](url) or [text] (url)
  const linkPlaceholders = [];
  html = html.replace(/\[(.*?)\]\s*\((.*?)\)/g, (match, linkText, url) => {
    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://') && !cleanUrl.startsWith('mailto:') && !cleanUrl.startsWith('tel:')) {
      cleanUrl = `https://${cleanUrl}`;
    }
    const idx = linkPlaceholders.length;
    linkPlaceholders.push(
      `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="news-inline-link" style="color: #003884; text-decoration: underline; text-underline-offset: 3px; font-weight: 700; word-break: break-all; cursor: pointer;">${linkText}</a>`
    );
    return `__LINK_PH_${idx}__`;
  });

  // 5. Process standalone raw URLs (http://, https://, www., or bare domains)
  const punctuationChars = ['.', ',', ';', ':', '!', '?', ')', ']', '}', '"', '\'', '”', '’', '»', '।'];
  html = html.replace(/(https?:\/\/[^\s<>'""'']+|www\.[^\s<>'""'']+|\b[a-zA-Z0-9-]+\.(?:com|in|org|net|co\.in|gov\.in|io|me|app)(?:\/[^\s<>'""'']*)?)/gi, (match) => {
    let url = match;
    let trailingPunct = '';
    while (url.length > 0 && punctuationChars.includes(url.slice(-1))) {
      trailingPunct = url.slice(-1) + trailingPunct;
      url = url.slice(0, -1);
    }
    if (!url) return trailingPunct;
    const href = url.startsWith('http://') || url.startsWith('https://') 
      ? url 
      : `https://${url}`;
    return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="news-inline-link" style="color: #003884; text-decoration: underline; text-underline-offset: 3px; font-weight: 700; word-break: break-all; cursor: pointer;">${url}</a>${trailingPunct}`;
  });

  // 6. Restore placeholders
  linkPlaceholders.forEach((tag, idx) => {
    html = html.replace(`__LINK_PH_${idx}__`, tag);
  });
  htmlLinkPlaceholders.forEach((tag, idx) => {
    html = html.replace(`__HTML_LINK_PH_${idx}__`, tag);
  });
  imagePlaceholders.forEach((tag, idx) => {
    html = html.replace(`__IMG_PH_${idx}__`, tag);
  });
  youtubePlaceholders.forEach((tag, idx) => {
    html = html.replace(`__YT_PH_${idx}__`, tag);
  });

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
      block.startsWith('<hr') ||
      block.startsWith('<figure') ||
      block.startsWith('<img') ||
      block.startsWith('<div class="news-youtube-embed"') ||
      block.startsWith('<p')
    ) {
      return block;
    }
    return `<p style="margin-bottom: 14px; line-height: 1.8;">${block.replace(/\n/g, '<br/>')}</p>`;
  }).join('');

  return html;
}

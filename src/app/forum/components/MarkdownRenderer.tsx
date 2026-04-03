import React from "react";

const safeParseMarkdown = (rawText: string) => {
  // 1. Prevent XSS by escaping HTML tags immediately
  let safeHtml = rawText
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  // 2. Parse Markdown syntax
  safeHtml = safeHtml
    // Images: ![alt](url)
    .replace(/!\[([^\]]*)\]\((.*?)\)/g, (match, alt, url) => {
      // Basic URL verification to avoid javascript: URIs
      const cleanUrl = url.startsWith('http') || url.startsWith('/') ? url : '';
      return `<img src="${cleanUrl}" alt="${alt}" style="max-width:100%; max-height:400px; border-radius:8px; margin: 1rem 0;" />`;
    })
    // Links: [Text](url)
    .replace(/\[([^\]]+)\]\((.*?)\)/g, (match, text, url) => {
      const cleanUrl = url.startsWith('http') || url.startsWith('/') ? url : '';
      return `<a href="${cleanUrl}" target="_blank" rel="noreferrer" style="color:#fff; text-decoration:underline;">${text}</a>`;
    })
    // Bold: **text**
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic: *text*
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Newlines to BR
    .replace(/\n/g, '<br />');

  return safeHtml;
};

export default function MarkdownRenderer({ content }: { content: string }) {
  const htmlContent = safeParseMarkdown(content);
  
  return (
    <div 
      className="markdown-body" 
      style={{ lineHeight: '1.7', fontSize: '1.05rem', color: '#eaeaea' }}
      dangerouslySetInnerHTML={{ __html: htmlContent }} 
    />
  );
}

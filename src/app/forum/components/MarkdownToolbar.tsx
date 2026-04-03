"use client";

import React from "react";

interface ToolbarProps {
  content: string;
  setContent: (value: string) => void;
  textareaId?: string;
}

export default function MarkdownToolbar({ content, setContent, textareaId = "md-textarea" }: ToolbarProps) {

  const insertText = (before: string, after: string = "") => {
    const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    // Si du texte est sélectionné, l'entourer
    if (start !== end) {
      const selectedText = content.substring(start, end);
      const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);
      setContent(newText);
    } else {
      // Sinon, insérer le tag et placer le curseur au milieu
      const newText = content.substring(0, start) + before + after + content.substring(end);
      setContent(newText);
      
      // Request focus back and move cursor efficiently (needs small timeout for React render cycle)
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + before.length, start + before.length);
      }, 0);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.8rem', padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
      <button 
        type="button" 
        onClick={() => insertText("**", "**")}
        style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.3rem 0.6rem', fontWeight: 'bold' }}
        title="Bold"
      >
        B
      </button>
      <button 
        type="button" 
        onClick={() => insertText("*", "*")}
        style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.3rem 0.6rem', fontStyle: 'italic' }}
        title="Italic"
      >
        I
      </button>
      <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)', margin: '0 0.2rem' }}></div>
      <button 
        type="button" 
        onClick={() => insertText("[", "](https://)")}
        style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.3rem 0.6rem' }}
        title="Link"
      >
        🔗 Link
      </button>
      <button 
        type="button" 
        onClick={() => {
          const url = prompt("Enter Image URL (Imgur, Discord, etc.):");
          if (url) insertText(`![Image](${url})`);
        }}
        style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.3rem 0.6rem' }}
        title="Image"
      >
        🖼️ Image
      </button>
    </div>
  );
}

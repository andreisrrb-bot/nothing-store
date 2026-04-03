"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MarkdownToolbar from "../../components/MarkdownToolbar";

export default function CreateTopicModal({ categoryId }: { categoryId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/forum/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, categoryId })
      });
      const data = await res.json();
      if (data.success) {
        setIsOpen(false);
        setTitle("");
        setContent("");
        router.push(`/forum/topic/${data.topic.id}`);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Error creating topic");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className="btn" onClick={() => setIsOpen(true)}>Start Discussion</button>

      {isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass" style={{ width: '90%', maxWidth: '600px', padding: '2.5rem', borderRadius: '24px', position: 'relative' }}>
            <button onClick={() => setIsOpen(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            <h2 style={{ fontFamily: 'Space Grotesk', marginBottom: '2rem', fontSize: '1.8rem' }}>New Discussion</h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  placeholder="Summarize your post..."
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '1rem', borderRadius: '8px' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Content (Markdown Supported)</label>
                <MarkdownToolbar content={content} setContent={setContent} textareaId="topic-textarea" />
                <textarea 
                  id="topic-textarea"
                  value={content} 
                  onChange={e => setContent(e.target.value)} 
                  placeholder="What's on your mind? Use the buttons above to format."
                  rows={6}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '1rem', borderRadius: '8px', resize: 'vertical' }}
                  required
                />
              </div>
              <button type="submit" className="btn" disabled={loading} style={{ alignSelf: 'flex-start' }}>
                {loading ? "Publishing..." : "Publish Topic"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

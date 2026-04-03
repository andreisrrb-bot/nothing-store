"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MarkdownToolbar from "../../components/MarkdownToolbar";
import toast from "react-hot-toast";

export default function ReplyPostForm({ topicId }: { topicId: string }) {
  const [content, setContent] = useState("");
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyToName, setReplyToName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleQuote = (e: any) => {
      // Nouvelle méthode: on lie le Post ID sans polluer le texte.
      setReplyToId(e.detail.id);
      setReplyToName(e.detail.author);
      
      const formElement = document.getElementById("reply-form-section");
      if (formElement) formElement.scrollIntoView({ behavior: "smooth" });
    };

    window.addEventListener("quote-post", handleQuote);
    return () => window.removeEventListener("quote-post", handleQuote);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/forum/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, topicId, replyToId })
      });
      const data = await res.json();
      if (data.success) {
        setContent("");
        setReplyToId(null);
        setReplyToName(null);
        toast.success("Réponse publiée !");
        router.refresh();
      } else {
        toast.error(data.error || "Erreur serveur");
      }
    } catch (err) {
      toast.error("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form id="reply-form-section" onSubmit={handleSubmit} style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
      <h3 style={{ fontFamily: 'Space Grotesk', marginBottom: '1rem', fontSize: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Post a reply
        {replyToName && (
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'Inter' }}>
            Replying to @{replyToName}
            <button type="button" onClick={() => { setReplyToId(null); setReplyToName(null); }} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '0 0.2rem' }}>✕</button>
          </div>
        )}
      </h3>
      
      <MarkdownToolbar content={content} setContent={setContent} textareaId="reply-textarea" />
      
      <textarea
        id="reply-textarea"
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Type your response here... (Markdown supported)"
        rows={4}
        required
        style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '1rem', borderRadius: '8px', resize: 'vertical', marginBottom: '1rem', fontSize: '1.05rem', fontFamily: 'inherit' }}
      />
      <button type="submit" className="btn" disabled={loading}>
        {loading ? "Posting..." : "Reply"}
      </button>
    </form>
  );
}

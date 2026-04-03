"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function UpvoteButton({ topicId, initialUpvotesCount, initialUpvoted }: { topicId: string, initialUpvotesCount: number, initialUpvoted: boolean }) {
  const [upvoted, setUpvoted] = useState(initialUpvoted);
  const [upvotesCount, setUpvotesCount] = useState(initialUpvotesCount);
  const [loading, setLoading] = useState(false);

  const toggleUpvote = async () => {
    if (loading) return;
    setLoading(true);
    
    // Optimistic UI
    setUpvoted(!upvoted);
    setUpvotesCount(upvoted ? upvotesCount - 1 : upvotesCount + 1);

    try {
      const res = await fetch(`/api/forum/topic/${topicId}/upvote`, { method: "POST" });
      
      if (!res.ok) {
        setUpvoted(upvoted);
        setUpvotesCount(initialUpvotesCount);
        toast.error("Veuillez vous connecter pour upvoter.");
      }
    } catch (e) {
      setUpvoted(upvoted);
      setUpvotesCount(initialUpvotesCount);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={toggleUpvote}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.4rem', 
        background: upvoted ? '#fff' : 'transparent',
        border: '1px solid #fff',
        color: upvoted ? '#000' : '#fff', cursor: 'pointer',
        fontFamily: 'Inter', fontSize: '0.9rem', transition: 'all 0.2s', marginTop: '1rem',
        padding: '0.4rem 0.8rem', outline: 'none', borderRadius: '50px', letterSpacing: '0.5px'
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="19" x2="12" y2="5"></line>
        <polyline points="5 12 12 5 19 12"></polyline>
      </svg>
      {upvotesCount} {upvotesCount > 1 ? 'Upvotes' : 'Upvote'}
    </button>
  );
}

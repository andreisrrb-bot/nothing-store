"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function LikeButton({ postId, initialLikesCount, initialLiked }: { postId: string, initialLikesCount: number, initialLiked: boolean }) {
  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [loading, setLoading] = useState(false);

  const toggleLike = async () => {
    if (loading) return;
    setLoading(true);
    
    // Optimistic UI
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);

    try {
      const res = await fetch(`/api/forum/posts/${postId}/like`, { method: "POST" });
      const data = await res.json();
      
      if (!res.ok) {
        // Revert on error
        setLiked(liked);
        setLikesCount(initialLikesCount);
        toast.error("Veuillez vous connecter pour aimer ce message.");
      }
    } catch (e) {
      setLiked(liked);
      setLikesCount(initialLikesCount);
      toast.error("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={toggleLike}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'transparent',
        border: 'none', color: liked ? '#ef4444' : '#666', cursor: 'pointer',
        fontFamily: 'Inter', fontSize: '0.9rem', transition: 'all 0.2s', marginTop: '1rem',
        padding: '0.3rem 0', outline: 'none'
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
      {likesCount} {likesCount > 1 ? 'Likes' : 'Like'}
    </button>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function DeletePostButton({ postId }: { postId: string }) {
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirming) {
      setConfirming(true);
      // Auto-cancel if the user doesn't click again within 4 seconds
      setTimeout(() => {
        setConfirming(false);
      }, 4000);
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`/api/forum/posts?id=${postId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Message supprimé");
        router.refresh();
      } else {
        toast.error("Erreur lors de la suppression");
        setConfirming(false);
      }
    } catch (e) {
      toast.error("Erreur réseau");
      setConfirming(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={loading}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.4rem', 
        background: confirming ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
        border: confirming ? '1px solid rgba(239, 68, 68, 0.5)' : 'none', 
        color: confirming ? '#ef4444' : '#666', cursor: 'pointer',
        fontFamily: 'Inter', fontSize: '0.8rem', transition: 'all 0.2s', marginTop: '1rem',
        padding: '0.3rem 0.6rem', borderRadius: '4px', outline: 'none'
      }}
      onMouseOver={(e) => { 
        if (!confirming) {
          e.currentTarget.style.color = '#ef4444'; 
          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; 
        }
      }}
      onMouseOut={(e) => { 
        if (!confirming) {
          e.currentTarget.style.color = '#666'; 
          e.currentTarget.style.background = 'transparent'; 
        }
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      </svg>
      {loading ? "..." : confirming ? "Confirm Delete?" : "Delete"}
    </button>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDeleteContentButton({ type, id, previewStr }: { type: "TOPIC" | "POST", id: string, previewStr: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const handleDelete = async () => {
    if (!confirm) {
       setConfirm(true);
       setTimeout(() => setConfirm(false), 3000);
       return;
    }

    setLoading(true);

    try {
      let res;
      if (type === "POST") {
        res = await fetch(`/api/forum/posts?id=${id}`, { method: "DELETE" });
      } else {
        res = await fetch(`/api/admin/topics/${id}`, { method: "DELETE" });
      }

      if (res.ok) {
        setConfirm(false);
        router.refresh();
      } else {
        console.error("Failed to delete content.");
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={loading}
      style={{ 
        background: confirm ? '#ef4444' : 'rgba(239, 68, 68, 0.1)', 
        border: confirm ? '1px solid #ef4444' : '1px solid rgba(239, 68, 68, 0.3)', 
        color: confirm ? '#fff' : '#ef4444', 
        padding: '0.4rem 0.8rem', 
        borderRadius: '4px', 
        cursor: loading ? 'not-allowed' : 'pointer',
        fontSize: '0.75rem',
        fontWeight: confirm ? 600 : 400,
        transition: 'all 0.2s',
        minWidth: '120px'
      }}
    >
      {loading ? "..." : confirm ? "Click again to confirm" : `Delete ${type.toLowerCase()}`}
    </button>
  );
}

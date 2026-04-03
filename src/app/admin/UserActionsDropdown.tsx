"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UserActionsDropdown({ userId, currentRole, currentName }: { userId: string, currentRole: string, currentName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirmAdmin, setConfirmAdmin] = useState(false);
  const [confirmBan, setConfirmBan] = useState(false);

  const handleToggleAdmin = async () => {
    if (!confirmAdmin) {
       setConfirmAdmin(true);
       setTimeout(() => setConfirmAdmin(false), 3000);
       return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: currentRole === "ADMIN" ? "USER" : "ADMIN" })
      });
      if (res.ok) {
        setConfirmAdmin(false);
        router.refresh();
      } else {
        console.error("Action failed.");
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirmBan) {
       setConfirmBan(true);
       setTimeout(() => setConfirmBan(false), 3000);
       return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      if (res.ok) {
        setConfirmBan(false);
        router.refresh();
      } else {
        console.error("Ban failed.");
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <button 
        onClick={handleToggleAdmin}
        disabled={loading}
        style={{ 
          background: confirmAdmin ? '#fff' : 'rgba(255,255,255,0.05)', 
          border: confirmAdmin ? '1px solid #fff' : '1px solid rgba(255,255,255,0.1)', 
          color: confirmAdmin ? '#000' : '#fff', 
          padding: '0.4rem 0.8rem', 
          borderRadius: '4px', 
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '0.75rem',
          transition: 'all 0.2s',
          fontWeight: confirmAdmin ? 600 : 400
        }}
      >
        {loading ? "..." : confirmAdmin ? "Confirm Role Change" : (currentRole === "ADMIN" ? "Revoke Admin" : "Make Admin")}
      </button>
      <button 
        onClick={handleDelete}
        disabled={loading}
        style={{ 
          background: confirmBan ? '#ef4444' : 'rgba(239, 68, 68, 0.1)', 
          border: confirmBan ? '1px solid #ef4444' : '1px solid rgba(239, 68, 68, 0.3)', 
          color: confirmBan ? '#fff' : '#ef4444', 
          padding: '0.4rem 0.8rem', 
          borderRadius: '4px', 
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '0.75rem',
          transition: 'all 0.2s',
          fontWeight: confirmBan ? 600 : 400
        }}
      >
        {loading ? "..." : confirmBan ? "PERMANENT BAN ? Click" : "Ban User"}
      </button>
    </div>
  );
}

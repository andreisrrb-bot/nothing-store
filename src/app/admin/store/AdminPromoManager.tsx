"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminPromoManager({ initialPromos }: { initialPromos: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const code = formData.get("code") as string;
    const discount = parseFloat(formData.get("discount") as string);
    
    try {
      const res = await fetch("/api/admin/promos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.toUpperCase(), discount })
      });

      if (res.ok) {
        ;(e.target as HTMLFormElement).reset();
        router.refresh();
      } else {
        const err = await res.json();
        alert(`Erreur: ${err.error}`);
      }
    } catch (e) {
      console.error(e);
      alert("Erreur réseau.");
    }

    setLoading(false);
  };

  const handleDelete = async (id: string, code: string) => {
    if (!window.confirm(`Voulez-vous révoquer et supprimer le code "${code}" ?`)) return;
    setDeletingId(id);

    try {
      const res = await fetch(`/api/admin/promos/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Erreur lors de la suppression.");
      }
    } catch (e) {
      console.error(e);
    }
    setDeletingId(null);
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.8rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '2rem' }}>Promo Codes</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '3rem' }}>
        
        {/* CREATE PROMO FORM */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', fontWeight: 600 }}>Create Promo</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: '#888', marginBottom: '0.4rem' }}>Code (ex: SUMMER20) *</label>
              <input type="text" name="code" required style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.8rem', borderRadius: '8px', fontFamily: 'Inter', textTransform: 'uppercase' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: '#888', marginBottom: '0.4rem' }}>Discount Percentage (%) *</label>
              <input type="number" step="1" name="discount" min="1" max="100" required style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.8rem', borderRadius: '8px', fontFamily: 'Inter' }} />
            </div>

            <button type="submit" disabled={loading} style={{ marginTop: '1rem', background: '#fff', color: '#000', border: 'none', padding: '1rem', borderRadius: '8px', fontWeight: 600, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', opacity: loading ? 0.7 : 1 }}>
              {loading ? "..." : "Generate Code"}
            </button>
          </form>
        </div>

        {/* LIST PROMOS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {initialPromos.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#888', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              No promo codes active.
            </div>
          ) : (
            initialPromos.map(promo => (
              <div key={promo.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                <div>
                   <div style={{ fontWeight: 700, fontSize: '1.2rem', color: '#fff', letterSpacing: '2px' }}>{promo.code}</div>
                   <div style={{ color: '#4ade80', fontSize: '0.9rem', marginTop: '0.3rem' }}>-{promo.discount}% OFF</div>
                </div>
                <button 
                  onClick={() => handleDelete(promo.id, promo.code)}
                  disabled={deletingId === promo.id}
                  style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '0.6rem 1rem', borderRadius: '6px', cursor: deletingId === promo.id ? 'not-allowed' : 'pointer' }}
                >
                  {deletingId === promo.id ? "Deleting..." : "Revoke"}
                </button>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

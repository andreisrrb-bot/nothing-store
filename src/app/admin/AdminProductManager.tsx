"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminProductManager({ initialProducts }: { initialProducts: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        body: formData // Form data gère automatiquement le header multipart/form-data
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
      alert("Erreur critique lors de l'upload.");
    }

    setLoading(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement le produit "${name}" ? (Impossible s'il y a déjà des commandes associées)`)) return;
    setDeletingId(id);

    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        const err = await res.json();
        alert(`Erreur: ${err.error}`);
      }
    } catch (e) {
      console.error(e);
    }
    setDeletingId(null);
  };

  return (
    <div style={{ marginTop: '4rem' }}>
      <h2 style={{ fontSize: '1.8rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '2rem' }}>Store Management: Products</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '3rem' }}>
        
        {/* ADD NEW PRODUCT FORM */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', fontWeight: 600 }}>Create New Product</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: '#888', marginBottom: '0.4rem' }}>Product Name *</label>
              <input type="text" name="name" required style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.8rem', borderRadius: '8px', fontFamily: 'Inter' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: '#888', marginBottom: '0.4rem' }}>Description *</label>
              <textarea name="description" required rows={3} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.8rem', borderRadius: '8px', fontFamily: 'Inter', resize: 'vertical' }}></textarea>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: '#888', marginBottom: '0.4rem' }}>Price (USD/EUR) *</label>
              <input type="number" step="0.01" name="price" required style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.8rem', borderRadius: '8px', fontFamily: 'Inter' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: '#888', marginBottom: '0.4rem' }}>Upload Product Image</label>
              <input type="file" name="image" accept="image/*" style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.8rem', borderRadius: '8px', fontFamily: 'Inter' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: '#888', marginBottom: '0.4rem' }}>Download URL (Hidden Link)</label>
              <input type="url" name="downloadUrl" placeholder="https://example.com/file.zip" style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.8rem', borderRadius: '8px', fontFamily: 'Inter' }} />
            </div>

            <button type="submit" disabled={loading} style={{ marginTop: '1rem', background: '#fff', color: '#000', border: 'none', padding: '1rem', borderRadius: '8px', fontWeight: 600, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', opacity: loading ? 0.7 : 1 }}>
              {loading ? "Uploading to Server..." : "Deploy Product to Store"}
            </button>
          </form>
        </div>

        {/* LIST EXISTING PRODUCTS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {initialProducts.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#888', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              No products found in the database.
            </div>
          ) : (
            initialProducts.map(product => (
              <div key={product.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                   <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', background: '#222' }}>
                     {product.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                     ) : (
                        <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.7rem', color:'#555' }}>No Image</div>
                     )}
                   </div>
                   <div>
                      <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{product.name}</div>
                      <div style={{ color: '#888', fontSize: '0.9rem' }}>${(product.price / 100).toFixed(2)}</div>
                      <div style={{ fontSize: '0.8rem', color: '#555', marginTop: '0.2rem' }}>{product.orders.length} orders total</div>
                   </div>
                </div>
                <button 
                  onClick={() => handleDelete(product.id, product.name)}
                  disabled={deletingId === product.id}
                  style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '0.6rem 1rem', borderRadius: '6px', cursor: deletingId === product.id ? 'not-allowed' : 'pointer' }}
                >
                  {deletingId === product.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

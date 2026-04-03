"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./admin.module.css";

export default function AdminForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"IDLE" | "LOADING" | "SUCCESS" | "ERROR">("IDLE");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("LOADING");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("imageUrl", imageUrl);
    if (file) {
      formData.append("file", file);
    }

    const response = await fetch("/api/admin/products", {
      method: "POST",
      body: formData, // Envoi en mode Multipart/form-data automatique
    });

    if (response.ok) {
      setStatus("SUCCESS");
      setName("");
      setDescription("");
      setPrice("");
      setImageUrl("");
      setFile(null);
      
      const fileInput = document.getElementById("fileInput") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      
      router.refresh(); 
      setTimeout(() => setStatus("IDLE"), 3000);
    } else {
      setStatus("ERROR");
      setTimeout(() => setStatus("IDLE"), 3000);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Admin Privileges.</h1>
      
      <div className={`glass ${styles.formContainer}`}>
        <h2 style={{ fontFamily: 'Space Grotesk', marginBottom: '1.5rem' }}>Create a product (Full Rights)</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Product Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              className={styles.input} 
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Description (Markdown allowed)</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              required 
              className={styles.input} 
            />
          </div>

          <div className={styles.formGroup}>
            <label>Price (€)</label>
            <input 
              type="number" 
              step="0.01" 
              value={price} 
              onChange={(e) => setPrice(e.target.value)} 
              required 
              className={styles.input} 
            />
          </div>

          <div className={styles.formGroup}>
            <label>Showcase Image (External URL - e.g. Unsplash)</label>
            <input 
              type="url" 
              value={imageUrl} 
              onChange={(e) => setImageUrl(e.target.value)} 
              className={styles.input} 
              placeholder="https://... (Optional)"
            />
          </div>

          <div className={styles.formGroup} style={{ border: '1px dashed var(--nothing-red)', padding: '1.5rem', borderRadius: '8px', background: 'rgba(255,0,0,0.02)' }}>
            <label style={{ color: 'var(--nothing-red)', fontWeight: 'bold' }}>Physical file attached to this purchase</label>
            <input 
              type="file" 
              id="fileInput"
              onChange={(e) => setFile(e.target.files?.[0] || null)} 
              className={styles.input}
              required
              style={{ border: 'none', padding: '0.5rem 0', background: 'transparent' }}
            />
            <p style={{ opacity: 0.6, fontSize: '0.85rem', marginTop: '0.5rem', fontStyle: 'italic' }}>
              The client will download this exact file directly from your own server after payment.
            </p>
          </div>

          <button 
            type="submit" 
            className="btn" 
            disabled={status === "LOADING" || status === "SUCCESS"}
            style={{
              transition: 'all 0.3s ease',
              background: status === "SUCCESS" ? "#22c55e" : status === "ERROR" ? "#ef4444" : undefined,
              color: status === "SUCCESS" || status === "ERROR" ? "#fff" : undefined,
              border: status === "SUCCESS" ? "1px solid #22c55e" : status === "ERROR" ? "1px solid #ef4444" : undefined
            }}
          >
            {status === "LOADING" ? "Uploading to server..." : 
             status === "SUCCESS" ? "✓ Product Published!" :
             status === "ERROR" ? "✕ Upload Failed" : 
             "Deploy & Start Selling"}
          </button>
        </form>
      </div>
    </div>
  );
}

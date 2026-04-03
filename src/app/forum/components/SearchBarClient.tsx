"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../forum.module.css";

export default function SearchBarClient() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/forum/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className={styles.searchBar}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      <input 
        type="text" 
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search the community..." 
      />
      <div className={styles.searchShortcut}>↵ Enter</div>
    </form>
  );
}

"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button 
      className="btn btn-outline" 
      onClick={() => signOut({ callbackUrl: "/" })}
      style={{ 
        borderColor: '#333', 
        color: '#fff', 
        fontSize: '0.85rem', 
        padding: '0.5rem 1rem' 
      }}
    >
      Se déconnecter
    </button>
  );
}

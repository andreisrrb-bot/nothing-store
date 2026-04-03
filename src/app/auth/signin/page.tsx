"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const res = await signIn("credentials", {
      email,
      password,
      isRegister: isRegister ? "true" : "false",
      redirect: false,
    });

    if (res?.error) {
      setErrorMsg(res.error);
      setLoading(false);
    } else {
      router.push("/profile");
      router.refresh();
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '2rem' }}>
      <div className="glass" style={{ padding: '4rem', width: '100%', maxWidth: '450px', borderRadius: '24px' }}>
        <h2 style={{ fontFamily: 'Space Grotesk', fontSize: '2.5rem', marginBottom: '0.5rem', textAlign: 'center' }}>
          {isRegister ? "Nouveau compte." : "Identity."}
        </h2>
        <p style={{ textAlign: 'center', opacity: 0.6, marginBottom: '2rem' }}>
          {isRegister ? "Rejoignez l'écosystème Nothing." : "Accédez à votre espace."}
        </p>

        {errorMsg && (
          <div style={{ background: 'rgba(237, 28, 36, 0.1)', color: '#ed1c24', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', border: '1px solid rgba(237, 28, 36, 0.2)' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.7 }}>Email adresse</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required 
              style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '12px', outline: 'none' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.7 }}>Mot de passe</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required 
              style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '12px', outline: 'none' }} />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input 
              type="checkbox" 
              id="remember" 
              checked={rememberMe} 
              onChange={(e) => setRememberMe(e.target.checked)} 
              style={{ cursor: 'pointer', accentColor: '#ffffff' }}
            />
            <label htmlFor="remember" style={{ opacity: 0.7, cursor: 'pointer', fontSize: '0.9rem' }}>Rester connecté</label>
          </div>

          <button type="submit" className="btn" style={{ marginTop: '0.5rem', width: '100%' }} disabled={loading}>
            {loading ? "Chargement..." : (isRegister ? "S'inscrire" : "Accéder")}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
          <button 
            onClick={() => { setIsRegister(!isRegister); setErrorMsg(""); }} 
            style={{ background: 'none', border: 'none', color: 'var(--text-color)', opacity: 0.7, cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit', fontSize: '0.95rem' }}
          >
            {isRegister ? "Vous avez déjà un compte ? Se connecter" : "Pas de compte ? S'inscrire"}
          </button>
        </div>
      </div>
    </div>
  );
}

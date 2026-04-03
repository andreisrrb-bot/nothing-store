"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutButton({ productId, price }: { productId: string, price: number }) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      const session = await response.json();
      
      if (session.error) {
        alert(session.error);
        setLoading(false);
        return;
      }

      const stripe = await stripePromise;
      await stripe?.redirectToCheckout({ sessionId: session.id });
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', marginTop: 'auto' }}>
      <button 
        className="btn" 
        onClick={handleCheckout} 
        disabled={loading}
        style={{ 
          width: '100%', 
          minWidth: '160px', 
          opacity: loading ? 0.7 : 1,
          display: 'flex',
          justifyContent: 'center',
          gap: '8px'
        }}
      >
        {loading ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg className="spinner" viewBox="0 0 50 50" style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }}>
              <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeDasharray="90, 150" />
            </svg>
            Processing
          </span>
        ) : (
          "Purchase"
        )}
      </button>
      <div style={{ 
        fontSize: '0.65rem', 
        color: 'var(--text-secondary)', 
        marginTop: '0.8rem', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '4px', 
        textTransform: 'uppercase', 
        letterSpacing: '1px',
        opacity: 0.6 
      }}>
        <svg fill="currentColor" width="9" height="9" viewBox="0 0 24 24">
          <path d="M12 2C9.243 2 7 4.243 7 7v3H6c-1.103 0-2 .897-2 2v8c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-8c0-1.103-.897-2-2-2h-1V7c0-2.757-2.243-5-5-5zm-3 8V7c0-1.654 1.346-3 3-3s3 1.346 3 3v3H9z"/>
        </svg> 
        Secured by Stripe
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
}

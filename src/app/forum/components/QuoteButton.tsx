"use client";

export default function QuoteButton({ postId, authorName }: { postId: string, authorName: string }) {
  const handleQuoteClick = () => {
    window.dispatchEvent(new CustomEvent("quote-post", { 
      detail: { id: postId, author: authorName } 
    }));
  };

  return (
    <button 
      onClick={handleQuoteClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'transparent',
        border: '1px solid rgba(255,255,255,0.1)', color: '#888', cursor: 'pointer',
        fontFamily: 'Inter', fontSize: '0.8rem', transition: 'all 0.2s', marginTop: '1rem',
        padding: '0.3rem 0.6rem', borderRadius: '4px', outline: 'none'
      }}
      onMouseOver={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
      onMouseOut={(e) => { e.currentTarget.style.color = '#888'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 17 4 12 9 7"></polyline>
        <path d="M20 18v-2a4 4 0 0 0-4-4H4"></path>
      </svg>
      Reply
    </button>
  );
}

"use client";

import { useState, useEffect } from "react";
import MarkdownRenderer from "../../components/MarkdownRenderer";
import LikeButton from "../../components/LikeButton";
import DeletePostButton from "../../components/DeletePostButton";
import QuoteButton from "../../components/QuoteButton";
import styles from "../../forum.module.css";

function RankBadge({ xp }: { xp: number | undefined }) {
  const safeXp = Math.max(xp || 0, 0);
  // Formule RPG : XP requis = (Niveau - 1)^2 * 150
  // Lv 1 = 0 XP | Lv 2 = 150 XP | Lv 3 = 600 XP | Lv 4 = 1350 XP
  const level = Math.floor(Math.sqrt(safeXp / 150)) + 1;

  if (level >= 10) return <span style={{ padding: '0.1rem 0.4rem', background: 'rgba(212, 175, 55, 0.1)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.5px', marginLeft: '0.5rem' }}>ELITE (Lv. {level})</span>;
  if (level >= 5)  return <span style={{ padding: '0.1rem 0.4rem', background: 'rgba(167, 139, 250, 0.1)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.3)', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.5px', marginLeft: '0.5rem' }}>VETERAN (Lv. {level})</span>;
  if (level >= 3)  return <span style={{ padding: '0.1rem 0.4rem', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.5px', marginLeft: '0.5rem' }}>ACTIVE (Lv. {level})</span>;
  return <span style={{ padding: '0.1rem 0.4rem', background: 'rgba(255, 255, 255, 0.05)', color: '#888', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.5px', marginLeft: '0.5rem' }}>MEMBER (Lv. {level})</span>;
}

export default function LiveRepliesList({ 
  initialPosts, 
  topicId, 
  topicAuthorRole, 
  topicAuthorName, 
  currentUserId 
}: { 
  initialPosts: any[], 
  topicId: string, 
  topicAuthorRole: string,
  topicAuthorName: string,
  currentUserId: string | null 
}) {
  const [posts, setPosts] = useState(initialPosts);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(`/api/forum/topic/${topicId}/posts`);
        const data = await res.json();
        if (data.posts && data.posts.length !== posts.length) {
          // Uniquement mettre à jour si le nombre a changé (pour éviter un rerender inutile)
          setPosts(data.posts);
        }
      } catch (error) {
        console.error("Erreur Live Refresh", error);
      }
    };

    // Polling toutes les 5 secondes
    const interval = setInterval(fetchPosts, 5000);
    return () => clearInterval(interval);
  }, [topicId, posts.length]);

  return (
    <div className={styles.repliesList}>
      {posts.map(post => (
        <div key={post.id} id={`post-${post.id}`} className={`${styles.postCard} glass ${post.author.role === 'ADMIN' ? styles.adminPost : ''}`} style={{ animation: 'fadeIn 0.5s ease-out' }}>
           <div className={styles.postAuthor}>
              <div className={styles.avatar}>
                 {post.author.image ? (
                   // eslint-disable-next-line @next/next/no-img-element
                   <img src={post.author.image} alt="Avatar" />
                 ) : '?'}
              </div>
              <strong>{post.author.name || post.author.email?.split('@')[0] || "Unknown"}</strong>
              <RankBadge xp={post.author.xp} />
              {post.author.role === 'ADMIN' && <span className={styles.adminBadge}>ADMIN</span>}
              {post.author.orders && post.author.orders.length > 0 && (
                 <span style={{ fontSize: '0.65rem', color: '#22c55e', border: '1px solid #22c55e', padding: '0.1rem 0.3rem', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', marginLeft: '0.5rem' }}>Verified Buyer</span>
              )}
           </div>
           <div className={styles.postContentBody}>
              <div className={styles.postDate} style={{marginBottom: '1rem'}}>
                 {new Date(post.createdAt).toLocaleString()}
              </div>
              
              {post.replyTo && (
                <a href={`#post-${post.replyTo.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.8rem 1rem', borderRadius: '8px', borderLeft: '3px solid #444', marginBottom: '1.5rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.4rem', fontFamily: 'Inter', fontWeight: 500 }}>
                      Replying to @{post.replyTo.author.name || post.replyTo.author.email?.split('@')[0] || "Unknown"}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#ccc', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {post.replyTo.content.replace("<!-- TARGET:TOPIC -->\n", "").substring(0, 150)}...
                    </div>
                  </div>
                </a>
              )}

              {!post.replyTo && post.content.startsWith("<!-- TARGET:TOPIC -->\n") && (
                <a href={`#topic-root`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.8rem 1rem', borderRadius: '8px', borderLeft: '3px solid #444', marginBottom: '1.5rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.4rem', fontFamily: 'Inter', fontWeight: 500 }}>
                      Replying to Topic by @{topicAuthorName}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#ccc', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      Cliquez pour remonter au sujet principal.
                    </div>
                  </div>
                </a>
              )}
              
              <MarkdownRenderer content={post.content.replace("<!-- TARGET:TOPIC -->\n", "")} />
              
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                 <LikeButton 
                    postId={post.id} 
                    initialLikesCount={post.likes.length} 
                    initialLiked={currentUserId ? post.likes.some((like: any) => like.userId === currentUserId) : false} 
                 />
                 <QuoteButton postId={post.id} authorName={post.author.name || post.author.email?.split('@')[0] || "Unknown"} />
                 {currentUserId && (currentUserId === post.authorId || topicAuthorRole === "ADMIN") && (
                   <DeletePostButton postId={post.id} />
                 )}
              </div>
           </div>
        </div>
      ))}
    </div>
  );
}

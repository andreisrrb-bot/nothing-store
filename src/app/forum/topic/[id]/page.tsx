import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import styles from "../../forum.module.css";
import ReplyPostForm from "./ReplyPostForm";
import MarkdownRenderer from "../../components/MarkdownRenderer";
import LikeButton from "../../components/LikeButton";
import UpvoteButton from "../../components/UpvoteButton";
import QuoteButton from "../../components/QuoteButton";
import DeletePostButton from "../../components/DeletePostButton";
import LiveRepliesList from "./LiveRepliesList";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();
export const revalidate = 0;

function RankBadge({ xp }: { xp: number | undefined }) {
  const safeXp = Math.max(xp || 0, 0);
  // Formule RPG : XP requis = (Niveau - 1)^2 * 150
  // Lv 1 = 0 XP | Lv 2 = 150 XP | Lv 3 = 600 XP | Lv 4 = 1350 XP
  const level = Math.floor(Math.sqrt(safeXp / 150)) + 1;

  if (level >= 10) return <span style={{ padding: '0.1rem 0.4rem', background: 'rgba(212, 175, 55, 0.1)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.5px', marginLeft: '0.5rem' }}>ELITE (Lv. {level})</span>;
  if (level >= 5) return <span style={{ padding: '0.1rem 0.4rem', background: 'rgba(167, 139, 250, 0.1)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.3)', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.5px', marginLeft: '0.5rem' }}>VETERAN (Lv. {level})</span>;
  if (level >= 3) return <span style={{ padding: '0.1rem 0.4rem', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.5px', marginLeft: '0.5rem' }}>ACTIVE (Lv. {level})</span>;
  return <span style={{ padding: '0.1rem 0.4rem', background: 'rgba(255, 255, 255, 0.05)', color: '#888', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.5px', marginLeft: '0.5rem' }}>MEMBER (Lv. {level})</span>;
}

export default async function TopicPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  let currentUserId = null;
  if (session && session.user && session.user.email) {
    const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (currentUser) currentUserId = currentUser.id;
  }

  await prisma.forumTopic.update({
    where: { id: params.id },
    data: { views: { increment: 1 } }
  }).catch(() => null);

  const topic = await prisma.forumTopic.findUnique({
    where: { id: params.id },
    include: {
      author: { select: { name: true, email: true, image: true, role: true, xp: true, orders: { where: { status: 'COMPLETED' }, select: { id: true } } } },
      category: true,
      upvotes: true,
      posts: {
        orderBy: { createdAt: 'asc' },
        include: {
          author: { select: { name: true, email: true, image: true, role: true, xp: true, orders: { where: { status: 'COMPLETED' }, select: { id: true } } } },
          likes: true,
          replyTo: {
            select: { id: true, content: true, author: { select: { name: true, email: true } } }
          }
        }
      }
    }
  });

  if (!topic) return <div style={{ padding: '5rem', textAlign: 'center' }}>Topic not found</div>;

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumb}>
        <Link href={`/forum/category/${topic.categoryId}`} className={styles.backLink}>← Back to {topic.category.name}</Link>
      </div>

      <div className={styles.topicHeaderBlock}>
        <h1 className={styles.topicTitleH1}>
          {topic.isPinned && <span className={styles.badgePinned} style={{ marginRight: '1rem' }}>📌 PINNED</span>}
          {topic.isLocked && <span className={styles.badgeLocked} style={{ marginRight: '1rem' }}>🔒 LOCKED</span>}
          {topic.title}
        </h1>
      </div>

      {/* Main Post */}
      <div id="topic-root" className={`${styles.postCard} glass ${topic.author.role === 'ADMIN' ? styles.adminPost : ''}`}>
        <div className={styles.postAuthor}>
          <div className={styles.avatar}>
            {topic.author.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={topic.author.image} alt="Avatar" />
            ) : '?'}
          </div>
          <strong>{topic.author.name || topic.author.email?.split('@')[0] || "Unknown"}</strong>
          <RankBadge xp={topic.author.xp} />
          {topic.author.role === 'ADMIN' && <span className={styles.adminBadge}>ADMIN</span>}
          {topic.author.orders && topic.author.orders.length > 0 && (
            <span style={{ fontSize: '0.65rem', color: '#22c55e', border: '1px solid #22c55e', padding: '0.1rem 0.3rem', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Verified Buyer</span>
          )}
        </div>
        <div className={styles.postContentBody}>
          <div className={styles.postDate}>{new Date(topic.createdAt).toLocaleString()}</div>
          <MarkdownRenderer content={topic.content} />
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <UpvoteButton
              topicId={topic.id}
              initialUpvotesCount={topic.upvotes.length}
              initialUpvoted={currentUserId ? topic.upvotes.some(upvote => upvote.userId === currentUserId) : false}
            />
            <QuoteButton postId={topic.id} authorName={topic.author.name || topic.author.email?.split('@')[0] || "Unknown"} />
          </div>
        </div>
      </div>

      <div className={styles.divider}></div>

      {/* Replies */}
      <LiveRepliesList
        initialPosts={topic.posts}
        topicId={topic.id}
        topicAuthorRole={topic.author.role}
        topicAuthorName={topic.author.name || topic.author.email?.split('@')[0] || "Unknown"}
        currentUserId={currentUserId}
      />

      {topic.isLocked ? (
        <div className={styles.lockedMessage}>
          🔒 This topic is locked. New replies are disabled.
        </div>
      ) : (
        <div style={{ marginTop: '3rem' }}>
          <ReplyPostForm topicId={topic.id} />
        </div>
      )}
    </div>
  );
}

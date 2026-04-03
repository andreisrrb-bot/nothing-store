import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import styles from "../../forum.module.css";
import CreateTopicModal from "./CreateTopicModal";

const prisma = new PrismaClient();

export const revalidate = 0;

export default async function CategoryPage({ params }: { params: { id: string } }) {
  const category = await prisma.forumCategory.findUnique({
    where: { id: params.id },
    include: {
      topics: {
        orderBy: [
          { isPinned: 'desc' },
          { createdAt: 'desc' }
        ],
        include: {
          author: { select: { name: true, email: true, image: true, role: true } },
          _count: { select: { posts: true } }
        }
      }
    }
  });

  if (!category) return <div style={{padding: '5rem', textAlign: 'center'}}>Category not found</div>;

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumb}>
        <Link href="/forum" className={styles.backLink}>← Back to Community</Link>
      </div>

      <header className={styles.headerArea} style={{ textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className={styles.title}>{category.name}</h1>
          <p className={styles.subtitle}>{category.description}</p>
        </div>
        <CreateTopicModal categoryId={category.id} />
      </header>

      <div className={styles.topicsGrid}>
        {category.topics.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No discussions found. Be the first to start one.</p>
        ) : (
          category.topics.map(topic => (
            <Link href={`/forum/topic/${topic.id}`} key={topic.id} className={`${styles.topicCard} ${topic.isPinned ? styles.pinnedCard : ''}`}>
              <div className={styles.topicMain}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  {topic.isPinned && <span className={styles.badgePinned}>📌 PINNED</span>}
                  {topic.isLocked && <span className={styles.badgeLocked}>🔒 LOCKED</span>}
                  <h3 className={styles.topicTitle}>{topic.title}</h3>
                </div>
                <div className={styles.topicMeta}>
                  Started by {topic.author.name || topic.author.email} • {new Date(topic.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className={styles.topicStats}>
                <div><strong>{topic._count.posts}</strong> Replies</div>
                <div><strong>{topic.views}</strong> Views</div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

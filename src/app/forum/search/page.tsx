import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import styles from "../forum.module.css";
import SearchBarClient from "../components/SearchBarClient";

const prisma = new PrismaClient();
export const revalidate = 0;

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams.q || "";

  let results: any[] = [];
  if (query.trim()) {
    results = await prisma.forumTopic.findMany({
      where: {
        OR: [
          { title: { contains: query } },
          { content: { contains: query } }
        ]
      },
      include: {
        author: { select: { name: true, email: true } },
        _count: { select: { posts: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumb}>
        <Link href="/forum" className={styles.backLink}>← Back to Community</Link>
      </div>

      <div className={styles.heroSection} style={{ padding: '3rem 2rem', marginBottom: '3rem' }}>
        <h1 className={styles.heroTitle} style={{ fontSize: '2.5rem' }}>Search Results</h1>
        <div style={{ maxWidth: '500px', width: '100%' }}>
           <SearchBarClient />
        </div>
      </div>

      <div className={styles.topicsGrid}>
        {!query.trim() ? (
          <p style={{ color: 'var(--text-secondary)' }}>Please enter a search query.</p>
        ) : results.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No discussions found for "{query}".</p>
        ) : (
          results.map(topic => (
            <Link href={`/forum/topic/${topic.id}`} key={topic.id} className={styles.topicCard}>
              <div className={styles.topicMain}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <h3 className={styles.topicTitle}>{topic.title}</h3>
                </div>
                <div className={styles.topicMeta}>
                  Started by {topic.author.name || topic.author.email} • {new Date(topic.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className={styles.topicStats}>
                <div><strong>{topic._count.posts}</strong> Replies</div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

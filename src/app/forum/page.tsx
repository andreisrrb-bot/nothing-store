import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import styles from "./forum.module.css";
import SearchBarClient from "@/app/forum/components/SearchBarClient";

const prisma = new PrismaClient();

export const revalidate = 0;

export default async function ForumHome() {
  // Try to fetch categories. If the DB push wasn't run, this will throw an error.
  let categories = [];
  try {
    categories = await prisma.forumCategory.findMany({
      include: {
        _count: {
          select: { topics: true }
        }
      }
    });

    if (categories.length === 0) {
      await prisma.forumCategory.createMany({
        data: [
          { name: "Announcements", description: "Official news and updates from the Nothing Store." },
          { name: "General Discussion", description: "Talk about digital assets, tech, and minimalism." },
          { name: "Support & Feedback", description: "Get help with your purchases or request features." },
        ]
      });
      categories = await prisma.forumCategory.findMany({
        include: { _count: { select: { topics: true } } }
      });
    }
  } catch (e) {
    console.error("Forum fetch error. DB Push likely needed.", e);
  }

  return (
    <div className={styles.container}>
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
           <h1 className={styles.heroTitle}>Nothing Community.</h1>
           <p className={styles.heroSubtitle}>Connect, share ideas, and elevate the standard of design.</p>
           
           <SearchBarClient />
        </div>
      </div>

      <div className={styles.categoryList}>
        {categories.length === 0 ? (
          <div className="glass" style={{ padding: '4rem 2rem', textAlign: 'center', borderRadius: '16px' }}>
            <h2 style={{ fontFamily: 'Space Grotesk', fontSize: '1.5rem', marginBottom: '1rem' }}>System Booting...</h2>
            <p style={{ color: 'var(--text-secondary)' }}>No categories found or database sync required.</p>
          </div>
        ) : (
          categories.map(category => (
            <Link href={`/forum/category/${category.id}`} key={category.id} className={`glass ${styles.categoryCard}`}>
              <div>
                <h2 className={styles.categoryName}>
                  {category.name}
                  <span style={{ fontSize: '1.2rem', opacity: 0.5, transition: '0.3s' }} className="cat-arrow">→</span>
                </h2>
                <p className={styles.categoryDesc}>{category.description}</p>
              </div>
              <div className={styles.statsCount}>
                <span>{category._count.topics}</span>
                <small>Topics</small>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

import Link from "next/link";
import styles from "./page.module.css";
import { PrismaClient } from "@prisma/client";
import CheckoutButton from "../components/CheckoutButton";

const prisma = new PrismaClient();

export const revalidate = 0;

export default async function Home() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <>
      <header className={styles.hero}>
        <div className={styles.badge}>New Collection</div>
        <h1 className={styles.title}>Less is<br/>Everything.</h1>
        <p className={styles.subtitle}>Designed without excess, driven by power. Pure minimalist excellence.</p>
        <Link href="#store" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          Explore Collection
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </Link>
      </header>

      <div className={styles.container}>
        <div className={styles.sectionHeader} id="store">
          <div>
            <h2 className={styles.sectionTitle}>Catalog.</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>All premium products available.</p>
          </div>
          <span className={styles.productCount}>{products.length} {products.length > 1 ? 'Items' : 'Item'}</span>
        </div>

        <div className={styles.filters}>
          <button className={`${styles.filterChip} ${styles.active}`}>View All</button>
          <button className={styles.filterChip}>Scripts</button>
          <button className={styles.filterChip}>Interfaces</button>
        </div>

        <section className={styles.products}>
        {products.length === 0 ? (
          <div className="glass" style={{ padding: '5rem 2rem', textAlign: 'center', gridColumn: '1 / -1', borderRadius: '24px' }}>
            <h2 style={{ fontFamily: 'Space Grotesk', fontSize: '2rem' }}>The Void.</h2>
            <p style={{ marginTop: '1rem', opacity: 0.5, fontSize: '1.1rem' }}>Our collection is arriving shortly. Stay tuned.</p>
          </div>
        ) : (
          products.map((product) => (
            <div key={product.id} className={`glass ${styles.productCard}`}>
              <div className={styles.cardHeader}>
                <span className={styles.cardBadge}>Digital Product</span>
              </div>
              
              <div className={styles.imageDisplay}>
                {product.imageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={product.imageUrl} alt={product.name} />
                ) : (
                  <span className={styles.noImage}>NO_IMAGE</span>
                )}
              </div>

              <div className={styles.cardContent}>
                <h3 className={styles.productName}>{product.name}</h3>
                <p className={styles.productDesc}>{product.description}</p>
                
                <div className={styles.cardFooter}>
                  <span className={styles.priceTag}>{(product.price / 100).toFixed(2)} €</span>
                  <CheckoutButton productId={product.id} price={product.price} />
                </div>
              </div>
            </div>
          ))
        )}
        </section>
      </div>
    </>
  );
}

import styles from "./footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brandSection}>
          <h2 className={styles.brandName}>nothing.</h2>
          <p className={styles.brandDesc}>Pure minimalist excellence. Designed to disrupt the noise.</p>
        </div>
        <div className={styles.linksSection}>
          <div className={styles.column}>
            <h4>Products</h4>
            <a href="#store">Digital Scripts</a>
            <a href="#store">UI Libraries</a>
            <a href="#store">Server Assets</a>
          </div>
          <div className={styles.column}>
            <h4>Support</h4>
            <a href="https://discord.gg/secretserviceidf" target="_blank" rel="noreferrer">Discord Server</a>
            <a href="/profile">My Account</a>
            <a href="#">FAQ & Guides</a>
          </div>
          <div className={styles.column}>
            <h4>Legal</h4>
            <a href="#">Terms of Service</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Refund Policy</a>
          </div>
        </div>
      </div>
      <div className={styles.bottomBar}>
        <p>SYS_LOG: &copy; {new Date().getFullYear()} NOTHING STORE. OPERATION NORMAL.</p>
      </div>
    </footer>
  );
}

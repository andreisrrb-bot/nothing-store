"use client";

import { useEffect, useState } from "react";
import styles from "./popup.module.css";

export default function PromoPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className={styles.popupContainer}>
      <button className={styles.closeBtn} onClick={() => setVisible(false)} aria-label="Close">×</button>
      <div className={styles.popupContent}>
        <h4 className={styles.title}>Join Community</h4>
        <p className={styles.desc}>Get support & updates.</p>
        
        <div className={styles.actions}>
          <a href="https://discord.gg/secretserviceidf" target="_blank" rel="noreferrer" className={styles.discordLink}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.33-.35-.76-.53-1.09a.09.09 0 0 0-.07-.03c-1.5.26-2.94.71-4.27 1.33-.01 0-.02.01-.03.02-2.72 4.07-3.47 8.03-3.1 11.95.01.02.02.04.04.05 1.8 1.32 3.53 2.12 5.24 2.65.03.01.06-.01.08-.03.41-.56.78-1.16 1.11-1.78.02-.04-.01-.09-.06-.11a11.19 11.19 0 0 1-1.66-.79.08.08 0 0 1-.01-.13l.36-.27c.02-.01.04-.02.06-.01 3.2 1.46 6.66 1.46 9.83 0 .02-.01.04 0 .06.01l.36.27c.04.03.04.08.01.13a11.19 11.19 0 0 1-1.66.79.09.09 0 0 0-.06.11c.33.62.7 1.22 1.11 1.78.02.02.05.04.08.03 1.71-.53 3.44-1.33 5.24-2.65.02-.01.03-.03.04-.05.42-4.52-.69-8.4-3.13-11.93-.01-.01-.02-.01-.03-.02zM8.47 14.81c-1 0-1.83-.9-1.83-2.01s.81-2.01 1.83-2.01c1.02 0 1.84.9 1.83 2.01 0 1.11-.81 2.01-1.83 2.01zm7.06 0c-1 0-1.83-.9-1.83-2.01s.81-2.01 1.83-2.01c1.02 0 1.84.9 1.83 2.01 0 1.11-.81 2.01-1.83 2.01z"/>
            </svg>
            Discord
          </a>
          <div className={styles.promoBadge}>CODE: <span style={{ color: '#fff' }}>SECRET10</span></div>
        </div>
      </div>
    </div>
  );
}

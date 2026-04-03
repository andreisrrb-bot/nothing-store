"use client";

import { useState, useEffect } from "react";
import styles from "./profile.module.css";

export default function ProfileTabs({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState("orders");
  const [nameInput, setNameInput] = useState(user?.name || "");
  const [discordInput, setDiscordInput] = useState(user?.discord || "");
  const [discordAvatar, setDiscordAvatar] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState(user?.image || "");
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    // Suppression de l'ancienne vérification d'API obsolète
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameInput, discord: discordInput })
      });
      const data = await res.json();
      if (data.success) {
        setUpdateSuccess(true);
        setTimeout(() => setUpdateSuccess(false), 3000);
      } else {
        alert("Erreur lors de la mise à jour : " + data.error);
      }
    } catch (err) {
      alert("Erreur de connexion.");
    }
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.sidebar}>
        <h3 className={styles.sidebarTitle}>Overview</h3>
        <ul className={styles.sidebarList}>
          <li className={activeTab === "orders" ? styles.sidebarItemActive : styles.sidebarItem} onClick={() => setActiveTab("orders")}>Orders History</li>
          <li className={activeTab === "settings" ? styles.sidebarItemActive : styles.sidebarItem} onClick={() => setActiveTab("settings")}>Account Settings</li>
          <li className={activeTab === "payment" ? styles.sidebarItemActive : styles.sidebarItem} onClick={() => setActiveTab("payment")}>Payment Methods</li>
        </ul>
      </div>
      
      <div className={styles.mainPanel}>
        
        {/* TAB 1: ORDERS */}
        {activeTab === "orders" && (
          <div className="animate-entrance">
            <div className={styles.panelHeader}>
              <h2>My Orders</h2>
              <span className={styles.orderCount}>{user?.orders.length} TOTAL</span>
            </div>

            {user?.orders.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No orders passed yet. Explore the Store to start.</p>
              </div>
            ) : (
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th className={styles.textRight}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user?.orders.map((order: any) => (
                      <tr key={order.id}>
                        <td className={styles.productCell}>
                           <strong>{order.product.name}</strong>
                        </td>
                        <td className={styles.dateCell}>{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td>
                          <span className={`${styles.statusBadge} ${order.status === 'COMPLETED' ? styles.statusSuccess : styles.statusPending}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className={styles.actionCell}>
                          {order.status === "COMPLETED" && order.product.downloadUrl ? (
                            <a href={order.product.downloadUrl} target="_blank" rel="noreferrer" className={styles.downloadBtn}>
                              [DL] File
                            </a>
                          ) : (
                            <span className={styles.lockedBtn}>Locked</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SETTINGS */}
        {activeTab === "settings" && (
          <div className="animate-entrance">
            <div className={styles.panelHeader}>
              <h2>Account Settings</h2>
            </div>
            
            <div className={styles.settingsCard}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2.5rem' }}>
                <div style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {user?.discord ? (
                    <img src={user.image || `https://cdn.discordapp.com/embed/avatars/0.png`} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Space Grotesk', fontSize: '2rem', color: 'rgba(255,255,255,0.2)' }}>?</div>
                  )}
                </div>
                <div>
                  <h3 style={{ fontFamily: 'Space Grotesk', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Discord Avatar</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    {user?.discord 
                      ? "Your profile picture is automatically synced from Discord." 
                      : "Link your Discord account below to display an avatar."}
                  </p>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile}>
                <div className={styles.formRow}>
                  <label>Account ID</label>
                  <input type="text" value={user?.id} readOnly className={styles.inputReadOnly} />
                </div>
                <div className={styles.formRow}>
                  <label>Email Address</label>
                  <input type="email" value={user?.email} readOnly className={styles.inputReadOnly} />
                </div>
                <div className={styles.formRow}>
                  <label>Display Name</label>
                  <input 
                    type="text" 
                    value={nameInput} 
                    onChange={e => setNameInput(e.target.value)} 
                    className={styles.inputActive} 
                    placeholder="Enter your name..." 
                  />
                </div>
                <div className={styles.formRow}>
                  <label>Discord Connection</label>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                    <div style={{ padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.05)', borderRight: '1px solid var(--border-color)', display: 'flex', alignItems: 'center' }}>
                      <svg width="20" height="20" viewBox="0 0 127.14 96.36" fill="#fff" xmlns="http://www.w3.org/2000/svg">
                        <path d="M107.7 8.07A105.15 105.15 0 0 0 81.47 0a72.06 72.06 0 0 0-3.36 6.83A97.68 97.68 0 0 0 49 6.83a72.37 72.37 0 0 0-3.38-6.83A106.6 106.6 0 0 0 19.43 8.07C2.79 33 0 55.8 2.65 78.43a105.65 105.65 0 0 0 32.17 16.32 77.7 77.7 0 0 0 6.89-11.23 68.42 68.42 0 0 1-10.85-5.18c.91-.66 1.8-1.34 2.66-2a75.57 75.57 0 0 0 60.1 0c.87.66 1.75 1.34 2.67 2a67.59 67.59 0 0 1-10.87 5.16 77.36 77.36 0 0 0 6.89 11.23A105.74 105.74 0 0 0 124.5 78.43c3.15-26.65-2.9-48.4-16.8-70.36zM42.56 65.34c-5.36 0-9.76-4.9-9.76-10.87 0-6 4.31-10.87 9.76-10.87 5.51 0 9.85 4.9 9.76 10.87-.1 6-4.31 10.87-9.76 10.87zm42 0c-5.36 0-9.76-4.9-9.76-10.87 0-6 4.31-10.87 9.76-10.87 5.51 0 9.85 4.9 9.76 10.87 0 6-4.35 10.87-9.76 10.87z" />
                      </svg>
                    </div>
                    {user?.discord ? (
                       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0.8rem 1rem' }}>
                          <span style={{color: '#22c55e', fontSize: '0.9rem', fontFamily: 'Inter', display: 'flex', alignItems: 'center', gap: '0.4rem'}}>
                            ✓ Compte Officiel Lié ({user?.discord})
                          </span>
                          <a href="/api/discord/link" style={{ fontSize: '0.8rem', color: '#fff', textDecoration: 'underline' }}>Changer</a>
                       </div>
                    ) : (
                       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0.8rem 1rem' }}>
                          <span style={{color: '#999', fontSize: '0.9rem', fontFamily: 'Inter'}}>Aucun compte lié</span>
                          <a href="/api/discord/link" style={{ background: '#5865F2', padding: '0.4rem 1rem', borderRadius: '4px', fontSize: '0.85rem', color: '#white', textDecoration: 'none', fontWeight: 600 }}>Lier mon Discord</a>
                       </div>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                  <button type="submit" className="btn">Save Profile Details</button>
                  {updateSuccess && <span style={{ color: '#22c55e', fontFamily: 'Inter', fontSize: '0.9rem', animation: 'fadeIn 0.3s ease-in-out' }}>✓ Profile saved successfully</span>}
                </div>
              </form>
            </div>

            <div className={styles.dangerZone}>
              <div>
                <h4 style={{fontFamily: 'Space Grotesk', fontSize: '1.2rem', marginBottom: '0.4rem'}}>Danger Zone</h4>
                <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>Permanently delete your account and all associated licenses. This action is irreversible.</p>
              </div>
              <button className={styles.dangerBtn} onClick={() => alert("Account deletion requires contacting support.")}>Delete Account</button>
            </div>
          </div>
        )}

        {/* TAB 3: PAYMENT METHODS */}
        {activeTab === "payment" && (
          <div className="animate-entrance">
            <div className={styles.panelHeader}>
              <h2>Payment Methods</h2>
            </div>

            <div className={styles.settingsCard}>
              <div className={styles.paymentFlex}>
                <div className={styles.virtualCard}>
                  <div className={styles.cardChip}></div>
                  <div className={styles.cardNumber}>•••• •••• •••• LINK</div>
                  <div className={styles.cardFooter}>
                    <span className={styles.cardBrand}>Stripe Secured</span>
                  </div>
                </div>
                
                <div className={styles.paymentInfo}>
                  <h3 style={{fontFamily: 'Space Grotesk', fontSize: '1.3rem', marginBottom: '0.5rem'}}>Stripe Express Checkout</h3>
                  <p style={{color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '1.5rem'}}>
                    We do not store your credit card details locally. Your payments are processed with bank-grade security via modern encrypted pipelines. Your saved cards remain available automatically via Apple Pay, Google Pay, or Stripe Link across all purchases.
                  </p>
                  <button onClick={() => alert("Redirection to Stripe Customer Portal pending API hook.")} className="btn btn-outline" style={{padding: '0.6rem 1.5rem'}}>
                    Manage Billing Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

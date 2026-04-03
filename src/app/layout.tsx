import type { Metadata } from "next";
import "./globals.css";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import PromoPopup from "../components/PromoPopup";
import Footer from "../components/Footer";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Nothing. | Premium Store",
  description: "High-quality store powered by Nothing.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  return (
    <html lang="fr">
      <body>
        <Toaster 
          position="top-center" 
          toastOptions={{
            style: {
              background: '#111',
              color: '#fff',
              border: '1px solid #333',
              fontFamily: 'Inter',
              borderRadius: '8px'
            }
          }} 
        />
        <nav className="navbar animate-entrance">
          <div className="nav-brand">nothing.</div>
          <div className="nav-links">
            <a href="/">Store</a>
            <a href="/forum">Community</a>
            <a href="/profile">Account</a>
            {isAdmin && <a href="/admin" style={{ opacity: 0.6 }}>Admin</a>}
          </div>
        </nav>
        <PromoPopup />
        <main className="animate-entrance" style={{ animationDelay: '0.1s', minHeight: '80vh' }}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminHotbar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Global Dashboard", path: "/admin" },
    { name: "Store Manager", path: "/admin/store" },
  ];

  return (
    <div style={{ 
      position: 'fixed', 
      top: '2rem', 
      left: '50%', 
      transform: 'translateX(-50%)', 
      background: 'rgba(10,10,10,0.85)', 
      backdropFilter: 'blur(16px)', 
      border: '1px solid rgba(255,255,255,0.08)', 
      padding: '0.4rem', 
      borderRadius: '50px', 
      display: 'flex', 
      gap: '0.5rem', 
      zIndex: 100,
      boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)'
    }}>
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        return (
          <Link 
            key={item.path} 
            href={item.path}
            style={{
              padding: '0.8rem 1.5rem',
              borderRadius: '40px',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: isActive ? '#000' : '#888',
              background: isActive ? '#fff' : 'transparent',
              transition: 'all 0.3s ease',
            }}
          >
            {item.name}
          </Link>
        );
      })}
    </div>
  );
}
